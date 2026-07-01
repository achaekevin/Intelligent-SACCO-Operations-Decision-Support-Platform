import { Member, SavingsAccount, Loan, Branch } from '../models/index.js';
import { SavingsTransaction } from '../models/Savings.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

class DashboardService {
  async getAdminStats(organizationId) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Total Members
    const totalMembers = await Member.count({
      where: { organizationId, status: { [Op.in]: ['active', 'pending'] } }
    });

    const activeMembers = await Member.count({
      where: { organizationId, status: 'active' }
    });

    // Total Savings (all active savings accounts)
    const [[savingsResult]] = await sequelize.query(
      `SELECT SUM(balance) as total FROM savings_accounts 
       WHERE organizationId = ? AND status = 'active' AND deletedAt IS NULL`,
      { replacements: [organizationId] }
    );
    const totalSavings = parseFloat(savingsResult?.total || 0);

    // Active Loans
    const activeLoans = await Loan.count({
      where: { organizationId, status: 'disbursed' }
    });

    // Pending Loans
    const pendingLoans = await Loan.count({
      where: { organizationId, status: 'pending' }
    });

    // Outstanding Loan Principal
    const [[loanResult]] = await sequelize.query(
      `SELECT SUM(principalBalance) as total FROM loans 
       WHERE organizationId = ? AND status = 'disbursed' AND deletedAt IS NULL`,
      { replacements: [organizationId] }
    );
    const outstandingLoans = parseFloat(loanResult?.total || 0);

    // Total Deposits (Month to Date)
    const [[depositsResult]] = await sequelize.query(
      `SELECT SUM(amount) as total FROM savings_transactions 
       WHERE organizationId = ? AND type = 'deposit' 
       AND status = 'completed' AND createdAt >= ?`,
      { replacements: [organizationId, startOfMonth] }
    );
    const totalDeposits = parseFloat(depositsResult?.total || 0);

    // Total Withdrawals (Month to Date)
    const [[withdrawalsResult]] = await sequelize.query(
      `SELECT SUM(amount) as total FROM savings_transactions 
       WHERE organizationId = ? AND type = 'withdrawal' 
       AND status = 'completed' AND createdAt >= ?`,
      { replacements: [organizationId, startOfMonth] }
    );
    const totalWithdrawals = parseFloat(withdrawalsResult?.total || 0);

    // Monthly Income (interest + fees from loans)
    const [[interestResult]] = await sequelize.query(
      `SELECT SUM(interestPaid) as total FROM loan_repayments 
       WHERE organizationId = ? AND status IN ('paid', 'partial') 
       AND paymentDate >= ? AND deletedAt IS NULL`,
      { replacements: [organizationId, startOfMonth] }
    );
    const interestIncome = parseFloat(interestResult?.total || 0);

    const [[feesResult]] = await sequelize.query(
      `SELECT SUM(processingFee + insuranceFee) as total FROM loans 
       WHERE organizationId = ? AND status IN ('disbursed', 'completed') 
       AND disbursedAt >= ? AND deletedAt IS NULL`,
      { replacements: [organizationId, startOfMonth] }
    );
    const feeIncome = parseFloat(feesResult?.total || 0);

    const monthlyIncome = interestIncome + feeIncome;

    // Year to Date Revenue
    const [[ytdInterestResult]] = await sequelize.query(
      `SELECT SUM(interestPaid) as total FROM loan_repayments 
       WHERE organizationId = ? AND status IN ('paid', 'partial') 
       AND paymentDate >= ? AND deletedAt IS NULL`,
      { replacements: [organizationId, startOfYear] }
    );
    const ytdInterest = parseFloat(ytdInterestResult?.total || 0);

    const [[ytdFeesResult]] = await sequelize.query(
      `SELECT SUM(processingFee + insuranceFee) as total FROM loans 
       WHERE organizationId = ? AND status IN ('disbursed', 'completed') 
       AND disbursedAt >= ? AND deletedAt IS NULL`,
      { replacements: [organizationId, startOfYear] }
    );
    const ytdFees = parseFloat(ytdFeesResult?.total || 0);

    const yearToDateRevenue = ytdInterest + ytdFees;

    // Total Branches
    const totalBranches = await Branch.count({
      where: { organizationId, status: 'active' }
    });

    // Loan Default Rate
    const totalLoanAmount = await Loan.sum('principalAmount', {
      where: { organizationId, status: { [Op.in]: ['disbursed', 'defaulted', 'completed'] } }
    });
    const defaultedLoanAmount = await Loan.sum('principalAmount', {
      where: { organizationId, status: 'defaulted' }
    });
    const loanDefaultRate = totalLoanAmount > 0 
      ? ((defaultedLoanAmount || 0) / totalLoanAmount * 100).toFixed(2)
      : 0;

    return {
      totalMembers,
      activeMembers,
      totalSavings,
      activeLoans,
      pendingLoans,
      outstandingLoans,
      totalDeposits,
      totalWithdrawals,
      netCashFlow: totalDeposits - totalWithdrawals,
      monthlyIncome,
      yearToDateRevenue,
      totalBranches,
      loanDefaultRate: parseFloat(loanDefaultRate),
    };
  }

  async getRecentTransactions(organizationId, limit = 10) {
    const transactions = await SavingsTransaction.findAll({
      where: { organizationId },
      include: [
        {
          model: Member,
          as: 'member',
          attributes: ['id', 'firstName', 'lastName', 'memberNumber'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
    });

    return transactions.map(tx => ({
      id: tx.id,
      reference: tx.reference,
      type: tx.type,
      amount: tx.amount,
      status: tx.status,
      date: tx.createdAt,
      member: tx.member ? {
        id: tx.member.id,
        name: `${tx.member.firstName} ${tx.member.lastName}`,
        memberNumber: tx.member.memberNumber,
      } : null,
    }));
  }

  async getMemberStats(organizationId, userId) {
    // Find member by userId (user.id is directly the userId from auth table)
    const member = await Member.findOne({
      where: { organizationId },
      include: [{
        model: require('./index.js').User,
        as: 'userAccount',
        where: { id: userId }
      }]
    });

    if (!member) {
      return {
        savingsBalance: 0,
        shareCapitalBalance: 0,
        activeLoans: 0,
        totalLoanBalance: 0,
        memberSince: null,
      };
    }

    // Savings Balance (Ordinary Savings)
    const ordinarySavings = await SavingsAccount.findOne({
      where: { 
        organizationId, 
        memberId: member.id, 
        accountType: 'ordinary',
        status: 'active'
      }
    });

    // Share Capital Balance
    const shareCapital = await SavingsAccount.findOne({
      where: { 
        organizationId, 
        memberId: member.id, 
        accountType: 'share_capital',
        status: 'active'
      }
    });

    // Active Loans Count
    const activeLoans = await Loan.count({
      where: { 
        organizationId, 
        memberId: member.id, 
        status: 'disbursed'
      }
    });

    // Total Loan Balance
    const [[loanBalanceResult]] = await sequelize.query(
      `SELECT SUM(principalBalance) as total FROM loans 
       WHERE organizationId = ? AND memberId = ? AND status = 'disbursed' AND deletedAt IS NULL`,
      { replacements: [organizationId, member.id] }
    );
    const totalLoanBalance = parseFloat(loanBalanceResult?.total || 0);

    return {
      savingsBalance: parseFloat(ordinarySavings?.balance || 0),
      shareCapitalBalance: parseFloat(shareCapital?.balance || 0),
      activeLoans,
      totalLoanBalance,
      memberSince: member.createdAt,
      memberNumber: member.memberNumber,
      memberName: `${member.firstName} ${member.lastName}`,
    };
  }

  async getMemberTransactions(organizationId, userId, limit = 10) {
    // Find member by userId
    const member = await Member.findOne({
      where: { organizationId },
      include: [{
        model: require('./index.js').User,
        as: 'userAccount',
        where: { id: userId }
      }]
    });

    if (!member) {
      return [];
    }

    const transactions = await SavingsTransaction.findAll({
      where: { 
        organizationId,
        memberId: member.id
      },
      order: [['createdAt', 'DESC']],
      limit,
    });

    return transactions.map(tx => ({
      id: tx.id,
      reference: tx.reference,
      type: tx.type,
      amount: tx.amount,
      status: tx.status,
      date: tx.createdAt,
      description: tx.description,
      balanceAfter: tx.balanceAfter,
    }));
  }

  async getSavingsGrowth(organizationId, months = 6) {
    const results = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });

      const [[ordinaryResult]] = await sequelize.query(
        `SELECT SUM(balance) as total FROM savings_accounts 
         WHERE organizationId = ? AND accountType = 'ordinary' 
         AND status = 'active' AND createdAt < ? AND deletedAt IS NULL`,
        { replacements: [organizationId, nextDate] }
      );

      const [[shareResult]] = await sequelize.query(
        `SELECT SUM(balance) as total FROM savings_accounts 
         WHERE organizationId = ? AND accountType = 'share_capital' 
         AND status = 'active' AND createdAt < ? AND deletedAt IS NULL`,
        { replacements: [organizationId, nextDate] }
      );

      results.push({
        month: monthName,
        savings: parseFloat(ordinaryResult?.total || 0) / 1000000, // Convert to millions
        shareCapital: parseFloat(shareResult?.total || 0) / 1000000,
      });
    }

    return results;
  }

  async getMemberGrowth(organizationId, months = 6) {
    const results = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });

      const count = await Member.count({
        where: {
          organizationId,
          createdAt: { [Op.lt]: nextDate }
        }
      });

      results.push({
        month: monthName,
        members: count,
      });
    }

    return results;
  }
}

export default new DashboardService();
