import PDFDocument from 'pdfkit';
import { SavingsTransaction, Member, User } from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import { NotFoundError, AppError } from '../utils/errors.js';
import logger from '../utils/logger.js';

class TellerService {
  /**
   * Generate End of Day Report (PDF)
   */
  async generateEndOfDayReport(organizationId, userId, date = new Date()) {
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    // Get teller info
    const teller = await User.findByPk(userId, {
      attributes: ['id', 'firstName', 'lastName', 'email']
    });

    if (!teller) {
      throw new NotFoundError('Teller not found');
    }

    // Get all transactions for the day
    const transactions = await SavingsTransaction.findAll({
      where: {
        organizationId,
        createdAt: {
          [Op.gte]: startOfDay,
          [Op.lt]: endOfDay
        }
      },
      include: [{
        model: Member,
        as: 'member',
        attributes: ['firstName', 'lastName', 'memberNumber']
      }],
      order: [['createdAt', 'ASC']]
    });

    // Calculate summary
    const deposits = transactions.filter(t => t.type === 'deposit' && t.status === 'completed');
    const withdrawals = transactions.filter(t => t.type === 'withdrawal' && t.status === 'completed');
    const pending = transactions.filter(t => t.status === 'pending');

    const totalDeposits = deposits.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const totalWithdrawals = withdrawals.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const cashInHand = totalDeposits - totalWithdrawals;

    const mpesaTransactions = deposits.filter(t => t.paymentMethod === 'mpesa');
    const mpesaTotal = mpesaTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);

    return {
      date: startOfDay,
      teller: {
        name: `${teller.firstName} ${teller.lastName}`,
        email: teller.email
      },
      summary: {
        totalDeposits,
        depositCount: deposits.length,
        totalWithdrawals,
        withdrawalCount: withdrawals.length,
        cashInHand,
        mpesaTotal,
        mpesaCount: mpesaTransactions.length,
        pendingCount: pending.length,
        totalTransactions: transactions.length
      },
      transactions: transactions.map(t => ({
        reference: t.reference,
        type: t.type,
        amount: parseFloat(t.amount),
        status: t.status,
        paymentMethod: t.paymentMethod,
        member: t.member ? `${t.member.firstName} ${t.member.lastName} (${t.member.memberNumber})` : 'N/A',
        time: t.createdAt
      }))
    };
  }

  /**
   * Submit Cash Counting (Reconciliation)
   */
  async submitCashCounting(organizationId, userId, data) {
    const { date, denominations, totalCounted, notes } = data;
    
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    // Get actual cash in hand from transactions
    const [[result]] = await sequelize.query(
      `SELECT 
        SUM(CASE WHEN type = 'deposit' AND status = 'completed' THEN amount ELSE 0 END) as deposits,
        SUM(CASE WHEN type = 'withdrawal' AND status = 'completed' THEN amount ELSE 0 END) as withdrawals
       FROM savings_transactions 
       WHERE organizationId = ? AND DATE(createdAt) = DATE(?)`,
      { replacements: [organizationId, startOfDay] }
    );

    const expectedCash = parseFloat(result?.deposits || 0) - parseFloat(result?.withdrawals || 0);
    const variance = totalCounted - expectedCash;

    // Store in database (you'll need to create a cash_counting table)
    const record = {
      organizationId,
      userId,
      date: startOfDay,
      denominations: JSON.stringify(denominations),
      totalCounted,
      expectedCash,
      variance,
      notes,
      status: Math.abs(variance) > 100 ? 'variance' : 'balanced',
      submittedAt: new Date()
    };

    logger.info(`Cash counting submitted by user ${userId}: Counted=${totalCounted}, Expected=${expectedCash}, Variance=${variance}`);

    return {
      ...record,
      denominationBreakdown: denominations
    };
  }

  /**
   * Approve or Reject Transaction
   */
  async reviewTransaction(transactionId, organizationId, userId, action, notes) {
    const transaction = await SavingsTransaction.findOne({
      where: { id: transactionId, organizationId }
    });

    if (!transaction) {
      throw new NotFoundError('Transaction not found');
    }

    if (transaction.status !== 'pending') {
      throw new AppError('Only pending transactions can be reviewed', 400);
    }

    const newStatus = action === 'approve' ? 'completed' : 'rejected';
    
    await transaction.update({
      status: newStatus,
      reviewedBy: userId,
      reviewedAt: new Date(),
      reviewNotes: notes
    });

    logger.info(`Transaction ${transactionId} ${action}d by user ${userId}`);

    return transaction;
  }

  /**
   * Get Daily Target Progress
   */
  async getDailyTargets(organizationId, userId, date = new Date()) {
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    // Get actual performance
    const [[result]] = await sequelize.query(
      `SELECT 
        COUNT(DISTINCT memberId) as membersServed,
        COUNT(*) as totalTransactions,
        SUM(CASE WHEN type = 'deposit' AND status = 'completed' THEN amount ELSE 0 END) as deposits
       FROM savings_transactions 
       WHERE organizationId = ? AND createdAt >= ? AND createdAt < ?`,
      { replacements: [organizationId, startOfDay, endOfDay] }
    );

    // Default targets (these could come from a settings table)
    const targets = {
      membersServed: 50,
      totalTransactions: 100,
      deposits: 500000
    };

    const actual = {
      membersServed: parseInt(result?.membersServed || 0),
      totalTransactions: parseInt(result?.totalTransactions || 0),
      deposits: parseFloat(result?.deposits || 0)
    };

    return {
      date: startOfDay,
      targets,
      actual,
      progress: {
        membersServed: (actual.membersServed / targets.membersServed * 100).toFixed(1),
        totalTransactions: (actual.totalTransactions / targets.totalTransactions * 100).toFixed(1),
        deposits: (actual.deposits / targets.deposits * 100).toFixed(1)
      }
    };
  }

  /**
   * Get Teller Performance Metrics
   */
  async getPerformanceMetrics(organizationId, userId, startDate, endDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Daily breakdown
    const [dailyMetrics] = await sequelize.query(
      `SELECT 
        DATE(createdAt) as date,
        COUNT(*) as transactions,
        COUNT(DISTINCT memberId) as uniqueMembers,
        SUM(CASE WHEN type = 'deposit' AND status = 'completed' THEN amount ELSE 0 END) as deposits,
        SUM(CASE WHEN type = 'withdrawal' AND status = 'completed' THEN amount ELSE 0 END) as withdrawals,
        AVG(CASE WHEN status = 'completed' THEN TIMESTAMPDIFF(MINUTE, createdAt, updatedAt) END) as avgProcessingTime
       FROM savings_transactions 
       WHERE organizationId = ? AND createdAt >= ? AND createdAt <= ?
       GROUP BY DATE(createdAt)
       ORDER BY date DESC`,
      { replacements: [organizationId, start, end] }
    );

    // Overall summary
    const [[summary]] = await sequelize.query(
      `SELECT 
        COUNT(*) as totalTransactions,
        COUNT(DISTINCT memberId) as totalUniqueMembers,
        SUM(CASE WHEN type = 'deposit' AND status = 'completed' THEN amount ELSE 0 END) as totalDeposits,
        SUM(CASE WHEN type = 'withdrawal' AND status = 'completed' THEN amount ELSE 0 END) as totalWithdrawals,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejectedCount,
        AVG(CASE WHEN status = 'completed' THEN TIMESTAMPDIFF(MINUTE, createdAt, updatedAt) END) as avgProcessingTime
       FROM savings_transactions 
       WHERE organizationId = ? AND createdAt >= ? AND createdAt <= ?`,
      { replacements: [organizationId, start, end] }
    );

    return {
      period: {
        start: start,
        end: end,
        days: Math.ceil((end - start) / (1000 * 60 * 60 * 24))
      },
      summary: {
        totalTransactions: parseInt(summary?.totalTransactions || 0),
        totalUniqueMembers: parseInt(summary?.totalUniqueMembers || 0),
        totalDeposits: parseFloat(summary?.totalDeposits || 0),
        totalWithdrawals: parseFloat(summary?.totalWithdrawals || 0),
        rejectedCount: parseInt(summary?.rejectedCount || 0),
        avgProcessingTime: parseFloat(summary?.avgProcessingTime || 0),
        successRate: summary?.totalTransactions > 0 
          ? ((summary.totalTransactions - summary.rejectedCount) / summary.totalTransactions * 100).toFixed(1)
          : 0
      },
      dailyMetrics: dailyMetrics.map(day => ({
        date: day.date,
        transactions: parseInt(day.transactions),
        uniqueMembers: parseInt(day.uniqueMembers),
        deposits: parseFloat(day.deposits || 0),
        withdrawals: parseFloat(day.withdrawals || 0),
        avgProcessingTime: parseFloat(day.avgProcessingTime || 0)
      }))
    };
  }
}

export default new TellerService();
