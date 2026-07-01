import { sequelize, Loan, LoanRepayment, LoanProduct, Guarantor, Member, SavingsAccount } from '../models/index.js';
import { NotFoundError, AppError, ForbiddenError } from '../utils/errors.js';
import {
  generateTransactionRef, calculateEMI, calculateSimpleInterest,
  formatAmount, getPagination,
} from '../utils/helpers.js';
import { LOAN_STATUSES, TRANSACTION_TYPES } from '../constants/index.js';
import emailService from './emailService.js';
import logger from '../utils/logger.js';
import { Op } from 'sequelize';

class LoanService {
  // ─── Apply ──────────────────────────────────────────────────────
  async apply(organizationId, branchId, data, appliedBy) {
    const member = await Member.findOne({ where: { id: data.memberId, organizationId, status: 'active' } });
    if (!member) throw new NotFoundError('Active member not found.');

    const product = await LoanProduct.findOne({ where: { id: data.loanProductId, organizationId, isActive: true } });
    if (!product) throw new NotFoundError('Loan product not found or inactive.');

    if (data.principalAmount < product.minAmount || data.principalAmount > product.maxAmount) {
      throw new AppError(
        `Loan amount must be between KES ${product.minAmount.toLocaleString()} and KES ${product.maxAmount.toLocaleString()}.`, 400
      );
    }
    if (data.termMonths < product.minTermMonths || data.termMonths > product.maxTermMonths) {
      throw new AppError(`Loan term must be between ${product.minTermMonths} and ${product.maxTermMonths} months.`, 400);
    }

    // Check savings multiplier eligibility
    const savingsBalance = await this._getMemberTotalSavings(data.memberId, organizationId);
    const maxEligible = savingsBalance * product.multiplierOfSavings;
    if (data.principalAmount > maxEligible) {
      throw new AppError(
        `Loan amount exceeds eligibility. Maximum based on savings: KES ${maxEligible.toLocaleString()}.`, 400
      );
    }

    // Prevent duplicate active applications
    const existingActive = await Loan.findOne({
      where: { memberId: data.memberId, organizationId, status: { [Op.in]: ['pending', 'under_review', 'approved'] } },
    });
    if (existingActive) throw new AppError('Member already has a pending or approved loan application.', 400);

    const { interestAmount, totalRepayable, monthlyInstallment } = this._calculateLoanFigures(
      data.principalAmount, product.interestRate, product.interestMethod, data.termMonths
    );
    const processingFee = formatAmount(data.principalAmount * product.processingFeePercent / 100);
    const insuranceFee  = formatAmount(data.principalAmount * product.insuranceFeePercent / 100);

    const loan = await Loan.create({
      organizationId,
      branchId: branchId || member.branchId,
      memberId: data.memberId,
      loanProductId: data.loanProductId,
      loanNumber: await this._nextLoanNumber(organizationId),
      type: product.type,
      principalAmount: data.principalAmount,
      interestRate: product.interestRate,
      interestMethod: product.interestMethod,
      termMonths: data.termMonths,
      processingFee,
      insuranceFee,
      totalInterest: interestAmount,
      totalRepayable: totalRepayable + processingFee + insuranceFee,
      monthlyInstallment,
      principalBalance: data.principalAmount,
      interestBalance: interestAmount,
      penaltiesBalance: 0,
      totalPaid: 0,
      purpose: data.purpose,
      status: LOAN_STATUSES.PENDING,
      applicationDate: new Date().toISOString().split('T')[0],
      officerId: data.officerId || null,
      notes: data.notes,
    });

    logger.info(`Loan application ${loan.loanNumber} submitted by member ${member.memberNumber}`);
    return loan;
  }

  // ─── Approve ────────────────────────────────────────────────────
  async approve(loanId, organizationId, approvedBy, notes) {
    const loan = await this._getLoanOrThrow(loanId, organizationId);
    if (!['pending', 'under_review'].includes(loan.status)) {
      throw new AppError(`Cannot approve a loan with status: ${loan.status}.`, 400);
    }
    await loan.update({ status: LOAN_STATUSES.APPROVED, approvedAt: new Date(), approvedBy, notes: notes || loan.notes });

    const member = await Member.findByPk(loan.memberId);
    if (member?.email) {
      emailService.send({
        to: member.email,
        subject: 'Loan Application Approved',
        html: `<p>Dear ${member.firstName}, your loan application of KES ${parseFloat(loan.principalAmount).toLocaleString()} has been approved.</p>`,
      }).catch(() => {});
    }

    logger.info(`Loan ${loan.loanNumber} approved by ${approvedBy}`);
    return loan;
  }

  // ─── Reject ─────────────────────────────────────────────────────
  async reject(loanId, organizationId, rejectedBy, reason) {
    const loan = await this._getLoanOrThrow(loanId, organizationId);
    if (!['pending', 'under_review', 'approved'].includes(loan.status)) {
      throw new AppError(`Cannot reject a loan with status: ${loan.status}.`, 400);
    }
    await loan.update({ status: LOAN_STATUSES.REJECTED, rejectedAt: new Date(), rejectedBy, rejectionReason: reason });
    logger.info(`Loan ${loan.loanNumber} rejected: ${reason}`);
    return loan;
  }

  // ─── Disburse ───────────────────────────────────────────────────
  async disburse(loanId, organizationId, disbursedBy, { disbursementMethod, disbursementReference }) {
    const loan = await this._getLoanOrThrow(loanId, organizationId);
    if (loan.status !== LOAN_STATUSES.APPROVED) {
      throw new AppError(`Only approved loans can be disbursed. Current status: ${loan.status}.`, 400);
    }

    const t = await sequelize.transaction();
    try {
      const firstRepaymentDate = new Date();
      firstRepaymentDate.setMonth(firstRepaymentDate.getMonth() + 1);

      await loan.update({
        status: LOAN_STATUSES.DISBURSED,
        disbursedAt: new Date(),
        disbursedBy,
        disbursementMethod,
        disbursementReference,
        firstRepaymentDate: firstRepaymentDate.toISOString().split('T')[0],
      }, { transaction: t });

      // Generate repayment schedule
      await this._generateRepaymentSchedule(loan, firstRepaymentDate, t);

      await t.commit();
      logger.info(`Loan ${loan.loanNumber} disbursed via ${disbursementMethod}`);
      return loan;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  // ─── Repay ──────────────────────────────────────────────────────
  async repay(loanId, organizationId, { amount, paymentMethod, externalReference, processedBy }) {
    const loan = await this._getLoanOrThrow(loanId, organizationId);
    if (loan.status !== LOAN_STATUSES.DISBURSED) {
      throw new AppError(`Only disbursed loans can receive repayments. Status: ${loan.status}.`, 400);
    }
    if (amount <= 0) throw new AppError('Repayment amount must be greater than zero.', 400);

    const t = await sequelize.transaction();
    try {
      const parsedAmount = formatAmount(amount);

      // Apply to oldest unpaid installment first
      const nextDue = await LoanRepayment.findOne({
        where: { loanId, status: { [Op.in]: ['pending', 'partial', 'overdue'] } },
        order: [['dueDate', 'ASC']],
        transaction: t,
      });

      if (nextDue) {
        const remaining = formatAmount(nextDue.dueAmount - nextDue.amountPaid);
        const applied = Math.min(parsedAmount, remaining);
        await nextDue.update({
          amountPaid: formatAmount(nextDue.amountPaid + applied),
          principalPaid: formatAmount(nextDue.principalPaid + (applied * (nextDue.principalDue / nextDue.dueAmount))),
          interestPaid: formatAmount(nextDue.interestPaid + (applied * (nextDue.interestDue / nextDue.dueAmount))),
          paymentDate: new Date(),
          paymentMethod,
          externalReference,
          processedBy,
          status: applied >= remaining ? 'paid' : 'partial',
        }, { transaction: t });
      }

      // Update loan balance
      const newPrincipalBalance = Math.max(0, formatAmount(loan.principalBalance - parsedAmount));
      await loan.update({
        totalPaid: formatAmount(loan.totalPaid + parsedAmount),
        principalBalance: newPrincipalBalance,
        status: newPrincipalBalance === 0 ? LOAN_STATUSES.COMPLETED : loan.status,
        ...(newPrincipalBalance === 0 && { closedAt: new Date(), closedBy: processedBy }),
      }, { transaction: t });

      await t.commit();
      logger.info(`Loan ${loan.loanNumber} repayment KES ${parsedAmount} received`);
      return loan;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  // ─── Getters ────────────────────────────────────────────────────
  async list(organizationId, query = {}) {
    const { page, limit, offset } = getPagination(query);
    const where = { organizationId };
    if (query.status) where.status = query.status;
    if (query.memberId) where.memberId = query.memberId;
    if (query.branchId) where.branchId = query.branchId;

    const { rows, count } = await Loan.findAndCountAll({
      where, limit, offset,
      order: [['createdAt', 'DESC']],
      include: [
        { model: Member, as: 'member', attributes: ['id', 'firstName', 'lastName', 'memberNumber'] },
        { model: LoanProduct, as: 'product', attributes: ['id', 'name', 'type'] },
      ],
    });
    return { loans: rows, total: count, page, limit };
  }

  async getById(loanId, organizationId) {
    const loan = await Loan.findOne({
      where: { id: loanId, organizationId },
      include: [
        { model: Member, as: 'member' },
        { model: LoanProduct, as: 'product' },
        { model: Guarantor, as: 'guarantors', include: [{ model: Member, as: 'guarantor', attributes: ['id', 'firstName', 'lastName', 'memberNumber'] }] },
        { model: LoanRepayment, as: 'repayments', limit: 5, order: [['dueDate', 'ASC']] },
      ],
    });
    if (!loan) throw new NotFoundError('Loan not found.');
    return loan;
  }

  async getRepaymentSchedule(loanId, organizationId) {
    const loan = await this._getLoanOrThrow(loanId, organizationId);
    const schedule = await LoanRepayment.findAll({
      where: { loanId },
      order: [['dueDate', 'ASC']],
    });
    return { loan, schedule };
  }

  async addGuarantor(loanId, organizationId, { memberId, amountGuaranteed }) {
    const loan = await this._getLoanOrThrow(loanId, organizationId);
    if (!['pending', 'under_review'].includes(loan.status)) {
      throw new AppError('Guarantors can only be added to pending loans.', 400);
    }
    if (memberId === loan.memberId) throw new AppError('A borrower cannot guarantee their own loan.', 400);

    const guarantor = await Member.findOne({ where: { id: memberId, organizationId, status: 'active' } });
    if (!guarantor) throw new NotFoundError('Guarantor member not found or not active.');

    // Check if already a guarantor for this loan
    const existing = await Guarantor.findOne({ where: { loanId, memberId } });
    if (existing) throw new AppError('This member is already a guarantor for this loan.', 400);

    // Validate guarantor's savings capacity
    const guarantorSavings = await this._getMemberTotalSavings(memberId, organizationId);
    if (amountGuaranteed > guarantorSavings) {
      throw new AppError(
        `Guarantor's savings (KES ${guarantorSavings.toLocaleString()}) are insufficient to guarantee KES ${amountGuaranteed.toLocaleString()}.`, 400
      );
    }

    return Guarantor.create({ organizationId, loanId, memberId, amountGuaranteed, remainingLiability: amountGuaranteed });
  }

  async listGuarantors(organizationId, query = {}) {
    const { page, limit, offset } = getPagination(query);
    const where = { organizationId };
    if (query.memberId) where.memberId = query.memberId;
    if (query.loanId) where.loanId = query.loanId;
    if (query.status) where.status = query.status;

    const { rows, count } = await Guarantor.findAndCountAll({
      where, limit, offset,
      order: [['createdAt', 'DESC']],
      include: [
        { 
          model: Member, 
          as: 'guarantor', 
          attributes: ['id', 'firstName', 'lastName', 'memberNumber', 'email', 'phone'] 
        },
        { 
          model: Loan, 
          as: 'loan',
          attributes: ['id', 'loanNumber', 'principalAmount', 'status', 'type'],
          include: [
            { model: Member, as: 'member', attributes: ['id', 'firstName', 'lastName', 'memberNumber'] }
          ]
        },
      ],
    });
    return { guarantors: rows, total: count, page, limit };
  }

  async acceptGuarantor(guarantorId, organizationId, memberId) {
    const guarantor = await Guarantor.findOne({ where: { id: guarantorId, organizationId } });
    if (!guarantor) throw new NotFoundError('Guarantor record not found.');
    if (guarantor.memberId !== memberId) throw new ForbiddenError('You can only accept your own guarantor requests.');
    if (guarantor.status !== 'pending') throw new AppError(`Cannot accept guarantor with status: ${guarantor.status}.`, 400);

    await guarantor.update({ status: 'accepted', acceptedAt: new Date() });
    logger.info(`Guarantor ${guarantorId} accepted by member ${memberId}`);
    return guarantor;
  }

  async declineGuarantor(guarantorId, organizationId, memberId) {
    const guarantor = await Guarantor.findOne({ where: { id: guarantorId, organizationId } });
    if (!guarantor) throw new NotFoundError('Guarantor record not found.');
    if (guarantor.memberId !== memberId) throw new ForbiddenError('You can only decline your own guarantor requests.');
    if (guarantor.status !== 'pending') throw new AppError(`Cannot decline guarantor with status: ${guarantor.status}.`, 400);

    await guarantor.update({ status: 'declined' });
    logger.info(`Guarantor ${guarantorId} declined by member ${memberId}`);
    return guarantor;
  }

  async releaseGuarantor(guarantorId, organizationId, releasedBy) {
    const guarantor = await Guarantor.findOne({ 
      where: { id: guarantorId, organizationId },
      include: [{ model: Loan, as: 'loan' }]
    });
    if (!guarantor) throw new NotFoundError('Guarantor record not found.');
    if (!['completed', 'rejected'].includes(guarantor.loan.status)) {
      throw new AppError('Guarantors can only be released when loan is completed or rejected.', 400);
    }

    await guarantor.update({ 
      status: 'released', 
      releasedAt: new Date(), 
      releasedBy,
      remainingLiability: 0 
    });
    logger.info(`Guarantor ${guarantorId} released by ${releasedBy}`);
    return guarantor;
  }

  async getGuarantorLiability(memberId, organizationId) {
    const guarantors = await Guarantor.findAll({
      where: { memberId, organizationId, status: { [Op.in]: ['pending', 'accepted'] } },
      include: [{ 
        model: Loan, 
        as: 'loan',
        attributes: ['id', 'loanNumber', 'principalAmount', 'principalBalance', 'status', 'type'],
        include: [{ model: Member, as: 'member', attributes: ['firstName', 'lastName', 'memberNumber'] }]
      }],
    });

    const totalGuaranteed = guarantors.reduce((sum, g) => sum + parseFloat(g.amountGuaranteed), 0);
    const totalLiability = guarantors.reduce((sum, g) => sum + parseFloat(g.remainingLiability), 0);

    return {
      guarantors,
      summary: {
        totalLoansGuaranteed: guarantors.length,
        totalAmountGuaranteed: formatAmount(totalGuaranteed),
        totalRemainingLiability: formatAmount(totalLiability),
      },
    };
  }

  async getStats(organizationId) {
    const [total, disbursed, pending, completed, defaulted] = await Promise.all([
      Loan.count({ where: { organizationId } }),
      Loan.count({ where: { organizationId, status: 'disbursed' } }),
      Loan.count({ where: { organizationId, status: 'pending' } }),
      Loan.count({ where: { organizationId, status: 'completed' } }),
      Loan.count({ where: { organizationId, status: 'defaulted' } }),
    ]);

    const [[disbursedSum]] = await sequelize.query(
      `SELECT SUM(principalBalance) as totalOutstanding FROM loans WHERE organizationId = ? AND status = 'disbursed' AND deletedAt IS NULL`,
      { replacements: [organizationId] }
    );
    return { total, disbursed, pending, completed, defaulted, totalOutstanding: disbursedSum?.totalOutstanding || 0 };
  }

  // ─── Private helpers ─────────────────────────────────────────────
  _calculateLoanFigures(principal, rate, method, termMonths) {
    let interestAmount, totalRepayable, monthlyInstallment;
    if (method === 'flat') {
      interestAmount = formatAmount(calculateSimpleInterest(principal, rate, termMonths));
      totalRepayable = formatAmount(principal + interestAmount);
      monthlyInstallment = formatAmount(totalRepayable / termMonths);
    } else {
      monthlyInstallment = formatAmount(calculateEMI(principal, rate, termMonths));
      totalRepayable = formatAmount(monthlyInstallment * termMonths);
      interestAmount = formatAmount(totalRepayable - principal);
    }
    return { interestAmount, totalRepayable, monthlyInstallment };
  }

  async _generateRepaymentSchedule(loan, firstRepaymentDate, t) {
    const scheduleRows = [];
    const { principalAmount, interestRate, interestMethod, termMonths, monthlyInstallment } = loan;
    let remainingPrincipal = parseFloat(principalAmount);

    for (let i = 1; i <= termMonths; i++) {
      const dueDate = new Date(firstRepaymentDate);
      dueDate.setMonth(dueDate.getMonth() + (i - 1));

      let interestDue, principalDue;
      if (interestMethod === 'reducing_balance') {
        interestDue = formatAmount(remainingPrincipal * (interestRate / 100 / 12));
        principalDue = formatAmount(Math.min(monthlyInstallment - interestDue, remainingPrincipal));
      } else {
        interestDue = formatAmount((parseFloat(principalAmount) * (interestRate / 100) * (termMonths / 12)) / termMonths);
        principalDue = formatAmount(parseFloat(principalAmount) / termMonths);
      }

      remainingPrincipal = formatAmount(Math.max(0, remainingPrincipal - principalDue));

      scheduleRows.push({
        organizationId: loan.organizationId,
        loanId: loan.id,
        memberId: loan.memberId,
        reference: generateTransactionRef(),
        installmentNumber: i,
        dueDate: dueDate.toISOString().split('T')[0],
        dueAmount: formatAmount(principalDue + interestDue),
        principalDue,
        interestDue,
        penaltyDue: 0,
        amountPaid: 0,
        principalPaid: 0,
        interestPaid: 0,
        penaltyPaid: 0,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await LoanRepayment.bulkCreate(scheduleRows, { transaction: t });
  }

  async _getMemberTotalSavings(memberId, organizationId) {
    const [[result]] = await sequelize.query(
      `SELECT SUM(balance) as total FROM savings_accounts WHERE memberId = ? AND organizationId = ? AND status = 'active' AND deletedAt IS NULL`,
      { replacements: [memberId, organizationId] }
    );
    return parseFloat(result?.total || 0);
  }

  async _getLoanOrThrow(loanId, organizationId) {
    const loan = await Loan.findOne({ where: { id: loanId, organizationId } });
    if (!loan) throw new NotFoundError('Loan not found.');
    return loan;
  }

  async _nextLoanNumber(organizationId) {
    const count = await Loan.count({ where: { organizationId }, paranoid: false });
    const year = new Date().getFullYear();
    return `LN-${year}${String(count + 1).padStart(5, '0')}`;
  }
}

export default new LoanService();
