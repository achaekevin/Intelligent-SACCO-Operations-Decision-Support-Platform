import { sequelize, SavingsAccount, SavingsTransaction, Member } from '../models/index.js';
import { savingsAccountRepository, savingsTransactionRepository } from '../repositories/savingsRepository.js';
import { memberRepository } from '../repositories/index.js';
import { NotFoundError, AppError, ConflictError } from '../utils/errors.js';
import { generateTransactionRef, generateAccountNumber, formatAmount, getPagination } from '../utils/helpers.js';
import { TRANSACTION_TYPES, TRANSACTION_STATUSES, SAVINGS_ACCOUNT_TYPES } from '../constants/index.js';
import emailService from './emailService.js';
import logger from '../utils/logger.js';

class SavingsService {
  // ─── Account Management ─────────────────────────────────────

  async createAccount(organizationId, branchId, memberId, data) {
    const member = await memberRepository.findOne({ where: { id: memberId, organizationId } });
    if (!member) throw new NotFoundError('Member not found.');
    if (member.status !== 'active') throw new AppError('Only active members can open savings accounts.', 400);

    // Fixed deposit validations
    if (data.accountType === SAVINGS_ACCOUNT_TYPES.FIXED_DEPOSIT) {
      if (!data.fixedDepositAmount || !data.fixedDepositDurationMonths)
        throw new AppError('Fixed deposit requires amount and duration.', 400);
      const maturityDate = new Date();
      maturityDate.setMonth(maturityDate.getMonth() + data.fixedDepositDurationMonths);
      data.maturityDate = maturityDate.toISOString().split('T')[0];
      data.maturityAmount = formatAmount(
        data.fixedDepositAmount * (1 + (data.interestRate / 100) * (data.fixedDepositDurationMonths / 12))
      );
    }

    return SavingsAccount.create({
      organizationId,
      branchId,
      memberId,
      accountNumber: generateAccountNumber(data.accountType === SAVINGS_ACCOUNT_TYPES.ORDINARY ? 'SAV' : data.accountType === SAVINGS_ACCOUNT_TYPES.SHARE_CAPITAL ? 'SHR' : 'FD'),
      ...data,
      balance: 0,
      availableBalance: 0,
      status: 'active',
    });
  }

  async getAccounts(organizationId, query = {}) {
    const { page, limit, offset } = getPagination(query);
    const result = await savingsAccountRepository.findByOrganizationPaginated(organizationId, {
      limit, offset,
      search: query.search,
      accountType: query.accountType,
      status: query.status,
      branchId: query.branchId,
    });
    return { accounts: result.rows, total: result.count, page, limit };
  }

  async getAccountById(id, organizationId) {
    const account = await savingsAccountRepository.findByIdWithMember(id, organizationId);
    if (!account) throw new NotFoundError('Savings account not found.');
    return account;
  }

  async getAccountsByMember(memberId, organizationId) {
    return savingsAccountRepository.findByMember(memberId, organizationId);
  }

  // ─── Deposit ────────────────────────────────────────────────

  async deposit(organizationId, branchId, { accountId, amount, paymentMethod, externalReference, description, processedBy }) {
    if (amount <= 0) throw new AppError('Deposit amount must be greater than zero.', 400);

    const t = await sequelize.transaction();
    try {
      const account = await SavingsAccount.findOne({
        where: { id: accountId, organizationId },
        lock: t.LOCK.UPDATE,
        transaction: t,
      });
      if (!account) throw new NotFoundError('Savings account not found.');
      if (account.status !== 'active') throw new AppError('Cannot deposit to an inactive account.', 400);

      const parsedAmount = formatAmount(amount);
      const balanceBefore = formatAmount(account.balance);
      const balanceAfter = formatAmount(balanceBefore + parsedAmount);
      const reference = generateTransactionRef();

      // Create transaction record
      const transaction = await SavingsTransaction.create({
        organizationId,
        branchId: branchId || account.branchId,
        savingsAccountId: accountId,
        memberId: account.memberId,
        reference,
        type: TRANSACTION_TYPES.DEPOSIT,
        amount: parsedAmount,
        balanceBefore,
        balanceAfter,
        description: description || 'Savings deposit',
        paymentMethod: paymentMethod || 'cash',
        externalReference,
        status: TRANSACTION_STATUSES.COMPLETED,
        processedBy,
      }, { transaction: t });

      // Update account balance
      await account.update({
        balance: balanceAfter,
        availableBalance: balanceAfter,
        lastTransactionAt: new Date(),
      }, { transaction: t });

      await t.commit();

      // Notify member
      const member = await Member.findByPk(account.memberId);
      if (member) {
        emailService.sendTransactionNotification(member, transaction).catch(() => {});
      }

      logger.info(`Deposit: ${reference} — KES ${parsedAmount} to account ${account.accountNumber}`);
      return { transaction, account };
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  // ─── Withdrawal ─────────────────────────────────────────────

  async withdraw(organizationId, branchId, { accountId, amount, paymentMethod, externalReference, description, processedBy }) {
    if (amount <= 0) throw new AppError('Withdrawal amount must be greater than zero.', 400);

    const t = await sequelize.transaction();
    try {
      const account = await SavingsAccount.findOne({
        where: { id: accountId, organizationId },
        lock: t.LOCK.UPDATE,
        transaction: t,
      });
      if (!account) throw new NotFoundError('Savings account not found.');
      if (account.status !== 'active') throw new AppError('Cannot withdraw from an inactive account.', 400);
      if (account.accountType === SAVINGS_ACCOUNT_TYPES.FIXED_DEPOSIT && new Date() < new Date(account.maturityDate)) {
        throw new AppError('Fixed deposit has not matured yet.', 400);
      }

      const parsedAmount = formatAmount(amount);
      const balanceBefore = formatAmount(account.balance);
      const balanceAfter = formatAmount(balanceBefore - parsedAmount);

      if (balanceAfter < formatAmount(account.minimumBalance)) {
        throw new AppError(`Insufficient funds. Minimum balance of KES ${account.minimumBalance} must be maintained.`, 400);
      }

      const reference = generateTransactionRef();

      const transaction = await SavingsTransaction.create({
        organizationId,
        branchId: branchId || account.branchId,
        savingsAccountId: accountId,
        memberId: account.memberId,
        reference,
        type: TRANSACTION_TYPES.WITHDRAWAL,
        amount: parsedAmount,
        balanceBefore,
        balanceAfter,
        description: description || 'Savings withdrawal',
        paymentMethod: paymentMethod || 'cash',
        externalReference,
        status: TRANSACTION_STATUSES.COMPLETED,
        processedBy,
      }, { transaction: t });

      await account.update({
        balance: balanceAfter,
        availableBalance: balanceAfter,
        lastTransactionAt: new Date(),
      }, { transaction: t });

      await t.commit();

      const member = await Member.findByPk(account.memberId);
      if (member) emailService.sendTransactionNotification(member, transaction).catch(() => {});

      logger.info(`Withdrawal: ${reference} — KES ${parsedAmount} from account ${account.accountNumber}`);
      return { transaction, account };
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  // ─── Transfer ───────────────────────────────────────────────

  async transfer(organizationId, { fromAccountId, toAccountId, amount, description, processedBy }) {
    if (fromAccountId === toAccountId) throw new AppError('Cannot transfer to the same account.', 400);
    if (amount <= 0) throw new AppError('Transfer amount must be greater than zero.', 400);

    const t = await sequelize.transaction();
    try {
      const [fromAccount, toAccount] = await Promise.all([
        SavingsAccount.findOne({ where: { id: fromAccountId, organizationId }, lock: t.LOCK.UPDATE, transaction: t }),
        SavingsAccount.findOne({ where: { id: toAccountId, organizationId }, lock: t.LOCK.UPDATE, transaction: t }),
      ]);

      if (!fromAccount) throw new NotFoundError('Source account not found.');
      if (!toAccount) throw new NotFoundError('Destination account not found.');
      if (fromAccount.status !== 'active' || toAccount.status !== 'active') throw new AppError('Both accounts must be active.', 400);

      const parsedAmount = formatAmount(amount);
      if (formatAmount(fromAccount.balance) - parsedAmount < formatAmount(fromAccount.minimumBalance)) {
        throw new AppError('Insufficient balance for this transfer.', 400);
      }

      const groupRef = generateTransactionRef();
      const now = new Date();

      // Debit source
      await SavingsTransaction.create({
        organizationId, branchId: fromAccount.branchId, savingsAccountId: fromAccountId,
        memberId: fromAccount.memberId, reference: `${groupRef}-DR`,
        type: TRANSACTION_TYPES.TRANSFER, amount: parsedAmount,
        balanceBefore: formatAmount(fromAccount.balance),
        balanceAfter: formatAmount(fromAccount.balance) - parsedAmount,
        description: description || `Transfer to ${toAccount.accountNumber}`,
        paymentMethod: 'internal', status: TRANSACTION_STATUSES.COMPLETED, processedBy,
      }, { transaction: t });

      // Credit destination
      await SavingsTransaction.create({
        organizationId, branchId: toAccount.branchId, savingsAccountId: toAccountId,
        memberId: toAccount.memberId, reference: `${groupRef}-CR`,
        type: TRANSACTION_TYPES.TRANSFER, amount: parsedAmount,
        balanceBefore: formatAmount(toAccount.balance),
        balanceAfter: formatAmount(toAccount.balance) + parsedAmount,
        description: description || `Transfer from ${fromAccount.accountNumber}`,
        paymentMethod: 'internal', status: TRANSACTION_STATUSES.COMPLETED, processedBy,
      }, { transaction: t });

      await fromAccount.update({
        balance: formatAmount(fromAccount.balance) - parsedAmount,
        availableBalance: formatAmount(fromAccount.availableBalance) - parsedAmount,
        lastTransactionAt: now,
      }, { transaction: t });

      await toAccount.update({
        balance: formatAmount(toAccount.balance) + parsedAmount,
        availableBalance: formatAmount(toAccount.availableBalance) + parsedAmount,
        lastTransactionAt: now,
      }, { transaction: t });

      await t.commit();
      logger.info(`Transfer: ${groupRef} — KES ${parsedAmount} from ${fromAccount.accountNumber} to ${toAccount.accountNumber}`);
      return { reference: groupRef, amount: parsedAmount };
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  // ─── Reversal ───────────────────────────────────────────────

  async reverseTransaction(transactionId, organizationId, { reason, reversedBy }) {
    const original = await SavingsTransaction.findOne({ where: { id: transactionId, organizationId } });
    if (!original) throw new NotFoundError('Transaction not found.');
    if (original.status === TRANSACTION_STATUSES.REVERSED) throw new AppError('Transaction already reversed.', 400);

    const t = await sequelize.transaction();
    try {
      const account = await SavingsAccount.findOne({
        where: { id: original.savingsAccountId },
        lock: t.LOCK.UPDATE,
        transaction: t,
      });

      const isDebit = original.type === TRANSACTION_TYPES.WITHDRAWAL;
      const newBalance = formatAmount(isDebit
        ? parseFloat(account.balance) + parseFloat(original.amount)
        : parseFloat(account.balance) - parseFloat(original.amount));

      // Create reversal transaction
      await SavingsTransaction.create({
        organizationId,
        branchId: original.branchId,
        savingsAccountId: original.savingsAccountId,
        memberId: original.memberId,
        reference: generateTransactionRef(),
        type: TRANSACTION_TYPES.REVERSAL,
        amount: original.amount,
        balanceBefore: account.balance,
        balanceAfter: newBalance,
        description: `Reversal of ${original.reference}: ${reason}`,
        paymentMethod: 'internal',
        status: TRANSACTION_STATUSES.COMPLETED,
        originalTransactionId: original.id,
        processedBy: reversedBy,
      }, { transaction: t });

      await original.update({ status: TRANSACTION_STATUSES.REVERSED, reversedAt: new Date(), reversedBy, reversalReason: reason }, { transaction: t });
      await account.update({ balance: newBalance, availableBalance: newBalance, lastTransactionAt: new Date() }, { transaction: t });

      await t.commit();
      return { original, newBalance };
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  // ─── Transactions ────────────────────────────────────────────

  async getTransactions(organizationId, query = {}) {
    const { page, limit, offset } = getPagination(query);
    const result = await savingsTransactionRepository.findByOrganization(organizationId, {
      limit, offset,
      type: query.type,
      branchId: query.branchId,
      startDate: query.startDate,
      endDate: query.endDate,
    });
    return { transactions: result.rows, total: result.count, page, limit };
  }

  async getAccountTransactions(accountId, organizationId, query = {}) {
    const account = await savingsAccountRepository.findOne({ where: { id: accountId, organizationId } });
    if (!account) throw new NotFoundError('Savings account not found.');

    const { page, limit, offset } = getPagination(query);
    const result = await savingsTransactionRepository.findByAccount(accountId, {
      limit, offset, type: query.type, startDate: query.startDate, endDate: query.endDate,
    });
    return { transactions: result.rows, total: result.count, page, limit };
  }

  // ─── Interest Accrual ────────────────────────────────────────

  async accrueInterest(organizationId) {
    const accounts = await SavingsAccount.findAll({
      where: { organizationId, status: 'active', interestRate: { [sequelize.Sequelize?.Op ? 'gt' : 'gt']: 0 } },
    });

    const { Op } = await import('sequelize');
    const activeAccounts = await SavingsAccount.findAll({
      where: { organizationId, status: 'active', interestRate: { [Op.gt]: 0 } },
    });

    let credited = 0;
    for (const account of activeAccounts) {
      const monthlyRate = parseFloat(account.interestRate) / 100 / 12;
      const interest = formatAmount(parseFloat(account.balance) * monthlyRate);
      if (interest <= 0) continue;

      await this.deposit(organizationId, account.branchId, {
        accountId: account.id,
        amount: interest,
        paymentMethod: 'internal',
        description: 'Monthly interest credit',
        processedBy: null,
      });
      credited++;
    }

    logger.info(`Interest accrual: credited ${credited} accounts in org ${organizationId}`);
    return credited;
  }
}

export default new SavingsService();
