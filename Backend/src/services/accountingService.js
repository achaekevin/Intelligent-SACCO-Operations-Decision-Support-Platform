import { sequelize, Account, JournalEntry, JournalLine } from '../models/index.js';
import { generateTransactionRef } from '../utils/helpers.js';
import logger from '../utils/logger.js';

/**
 * Double-entry accounting service.
 *
 * Every financial event creates a balanced journal entry
 * (total debits === total credits).
 *
 * Account codes used by auto-posting:
 *   1010  Cash on Hand
 *   1030  M-Pesa Float
 *   2011  Ordinary Savings (liability — credit balance)
 *   2012  Share Capital   (liability — credit balance)
 *   4010  Interest Income
 *   5030  Interest on Deposits (expense)
 */
class AccountingService {
  /**
   * Create a balanced journal entry.
   * @param {Object} options
   * @param {string} options.organizationId
   * @param {string} options.description
   * @param {string} options.module        - 'savings' | 'loan' | 'expense' | ...
   * @param {string} options.sourceId      - ID of the originating record
   * @param {Array}  options.lines         - [{ accountCode, type: 'debit'|'credit', amount, description }]
   * @param {Object} options.transaction   - Sequelize transaction instance
   */
  async post({ organizationId, description, module, sourceId, lines, transaction: t }) {
    const totalDebit  = lines.filter((l) => l.type === 'debit').reduce((s, l) => s + parseFloat(l.amount), 0);
    const totalCredit = lines.filter((l) => l.type === 'credit').reduce((s, l) => s + parseFloat(l.amount), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.001) {
      throw new Error(`Journal entry is not balanced: debits=${totalDebit} credits=${totalCredit}`);
    }

    // Resolve account codes → IDs
    const codes = lines.map((l) => l.accountCode).filter(Boolean);
    const accounts = await Account.findAll({ where: { organizationId, code: codes } });
    const accountMap = Object.fromEntries(accounts.map((a) => [a.code, a.id]));

    const entry = await JournalEntry.create({
      organizationId,
      reference: generateTransactionRef(),
      date: new Date().toISOString().split('T')[0],
      description,
      module,
      sourceId,
      totalDebit,
      totalCredit,
      status: 'posted',
    }, { transaction: t });

    await JournalLine.bulkCreate(
      lines.map((l) => ({
        journalEntryId: entry.id,
        accountId: accountMap[l.accountCode] || l.accountId,
        organizationId,
        type: l.type,
        amount: parseFloat(l.amount),
        description: l.description || description,
      })),
      { transaction: t }
    );

    // Update account balances
    for (const line of lines) {
      const accountId = accountMap[line.accountCode] || line.accountId;
      if (!accountId) continue;
      const account = await Account.findByPk(accountId, { transaction: t });
      if (!account) continue;
      const delta = (line.type === account.normalBalance) ? parseFloat(line.amount) : -parseFloat(line.amount);
      await account.increment('balance', { by: delta, transaction: t });
    }

    logger.info(`Journal entry posted: ${entry.reference} — ${description}`);
    return entry;
  }

  /**
   * Post accounting entries for a savings deposit:
   *   DR  Cash on Hand / M-Pesa Float
   *   CR  Member Savings Liability
   */
  async postDeposit({ organizationId, amount, paymentMethod, savingsAccountType, transaction }) {
    const debitAccount = paymentMethod === 'mpesa' ? '1030' : '1010';
    const creditAccount = savingsAccountType === 'share_capital' ? '2012' : '2011';
    return this.post({
      organizationId,
      description: `Savings deposit — ${savingsAccountType}`,
      module: 'savings',
      lines: [
        { accountCode: debitAccount,  type: 'debit',  amount },
        { accountCode: creditAccount, type: 'credit', amount },
      ],
      transaction,
    });
  }

  /**
   * Post accounting entries for a savings withdrawal:
   *   DR  Member Savings Liability
   *   CR  Cash on Hand / M-Pesa Float
   */
  async postWithdrawal({ organizationId, amount, paymentMethod, savingsAccountType, transaction }) {
    const creditAccount = paymentMethod === 'mpesa' ? '1030' : '1010';
    const debitAccount = savingsAccountType === 'share_capital' ? '2012' : '2011';
    return this.post({
      organizationId,
      description: `Savings withdrawal — ${savingsAccountType}`,
      module: 'savings',
      lines: [
        { accountCode: debitAccount,  type: 'debit',  amount },
        { accountCode: creditAccount, type: 'credit', amount },
      ],
      transaction,
    });
  }

  /**
   * Post interest credit:
   *   DR  Interest on Deposits (expense)
   *   CR  Member Savings Liability
   */
  async postInterestCredit({ organizationId, amount, savingsAccountType, transaction }) {
    return this.post({
      organizationId,
      description: 'Monthly interest credit',
      module: 'savings',
      lines: [
        { accountCode: '5030', type: 'debit',  amount },
        { accountCode: savingsAccountType === 'share_capital' ? '2012' : '2011', type: 'credit', amount },
      ],
      transaction,
    });
  }

  async getTrialBalance(organizationId) {
    const accounts = await Account.findAll({
      where: { organizationId, isActive: true },
      order: [['code', 'ASC']],
    });
    const debits  = accounts.filter((a) => a.normalBalance === 'debit').reduce((s, a) => s + parseFloat(a.balance || 0), 0);
    const credits = accounts.filter((a) => a.normalBalance === 'credit').reduce((s, a) => s + parseFloat(a.balance || 0), 0);
    return { accounts, totalDebits: debits, totalCredits: credits, isBalanced: Math.abs(debits - credits) < 0.01 };
  }

  async getIncomeStatement(organizationId, { startDate, endDate } = {}) {
    const income   = await Account.findAll({ where: { organizationId, type: 'income', isActive: true } });
    const expenses = await Account.findAll({ where: { organizationId, type: 'expense', isActive: true } });
    const totalIncome   = income.reduce((s, a) => s + parseFloat(a.balance || 0), 0);
    const totalExpenses = expenses.reduce((s, a) => s + parseFloat(a.balance || 0), 0);
    return { income, expenses, totalIncome, totalExpenses, netIncome: totalIncome - totalExpenses };
  }
}

export default new AccountingService();
