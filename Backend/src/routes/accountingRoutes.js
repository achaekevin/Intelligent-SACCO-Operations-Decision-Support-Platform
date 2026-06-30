import { Router } from 'express';
import { authenticate, authorize, tenantIsolation } from '../middlewares/auth.js';
import { ROLES } from '../constants/index.js';
import { Account, JournalEntry, JournalLine } from '../models/index.js';
import { successResponse, createdResponse, paginatedResponse, notFoundResponse } from '../utils/response.js';

const router = Router();
router.use(authenticate, tenantIsolation);

const accountants = [ROLES.SUPER_ADMIN, ROLES.SACCO_ADMIN, ROLES.ACCOUNTANT, ROLES.AUDITOR];

/**
 * @swagger
 * tags:
 *   name: Accounting
 *   description: Double-entry bookkeeping — chart of accounts, journals, financial statements
 */

// ─── Chart of Accounts ────────────────────────────────────────────────────────
/**
 * @swagger
 * /accounting/accounts:
 *   get:
 *     summary: List chart of accounts
 *     tags: [Accounting]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/accounts', authorize(...accountants), async (req, res, next) => {
  try {
    const where = { organizationId: req.user.organizationId };
    if (req.query.type)     where.type     = req.query.type;
    if (req.query.isActive) where.isActive = req.query.isActive === 'true';
    const accounts = await Account.findAll({ where, order: [['code', 'ASC']] });
    return successResponse(res, { data: accounts, message: `${accounts.length} accounts retrieved.` });
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /accounting/accounts:
 *   post:
 *     summary: Create a new account in the chart of accounts
 *     tags: [Accounting]
 *     security: [{ bearerAuth: [] }]
 */
router.post('/accounts', authorize(ROLES.SUPER_ADMIN, ROLES.SACCO_ADMIN, ROLES.ACCOUNTANT), async (req, res, next) => {
  try {
    const { code, name, type, category, normalBalance, parentId, description } = req.body;
    const existing = await Account.findOne({ where: { organizationId: req.user.organizationId, code } });
    if (existing) return res.status(409).json({ success: false, message: 'Account code already exists.', errors: [] });
    const account = await Account.create({
      organizationId: req.user.organizationId,
      code, name, type, category, normalBalance,
      parentId: parentId || null,
      description: description || null,
      balance: 0, isControl: false, isSystem: false, isActive: true,
    });
    return createdResponse(res, { message: 'Account created.', data: account });
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /accounting/accounts/{id}:
 *   get:
 *     summary: Get account details with balance
 *     tags: [Accounting]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/accounts/:id', authorize(...accountants), async (req, res, next) => {
  try {
    const account = await Account.findOne({ where: { id: req.params.id, organizationId: req.user.organizationId } });
    if (!account) return notFoundResponse(res, 'Account not found.');
    return successResponse(res, { data: account });
  } catch (err) { next(err); }
});

// ─── Journal Entries ──────────────────────────────────────────────────────────
/**
 * @swagger
 * /accounting/journal-entries:
 *   get:
 *     summary: List journal entries
 *     tags: [Accounting]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer } }
 *       - { in: query, name: limit, schema: { type: integer } }
 *       - { in: query, name: module, schema: { type: string } }
 *       - { in: query, name: startDate, schema: { type: string, format: date } }
 *       - { in: query, name: endDate, schema: { type: string, format: date } }
 */
router.get('/journal-entries', authorize(...accountants), async (req, res, next) => {
  try {
    const { Op } = await import('sequelize');
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const where = { organizationId: req.user.organizationId };
    if (req.query.module) where.module = req.query.module;
    if (req.query.startDate || req.query.endDate) {
      where.date = {};
      if (req.query.startDate) where.date[Op.gte] = req.query.startDate;
      if (req.query.endDate)   where.date[Op.lte] = req.query.endDate;
    }
    const { count, rows } = await JournalEntry.findAndCountAll({
      where, limit, offset: (page - 1) * limit,
      order: [['date', 'DESC'], ['createdAt', 'DESC']],
      include: [{ model: JournalLine, as: 'lines', include: [{ model: Account, as: 'account', attributes: ['code', 'name'] }] }],
    });
    return paginatedResponse(res, { data: rows, total: count, page, limit });
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /accounting/journal-entries:
 *   post:
 *     summary: Create a manual journal entry (must be balanced)
 *     tags: [Accounting]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [description, date, lines]
 *             properties:
 *               description: { type: string }
 *               date: { type: string, format: date }
 *               lines:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     accountCode: { type: string }
 *                     type: { type: string, enum: [debit, credit] }
 *                     amount: { type: number }
 */
router.post('/journal-entries', authorize(ROLES.SUPER_ADMIN, ROLES.SACCO_ADMIN, ROLES.ACCOUNTANT), async (req, res, next) => {
  try {
    const accountingService = (await import('../services/accountingService.js')).default;
    const entry = await accountingService.post({
      organizationId: req.user.organizationId,
      description: req.body.description,
      module: req.body.module || 'manual',
      sourceId: req.body.sourceId || null,
      lines: req.body.lines,
    });
    return createdResponse(res, { message: 'Journal entry posted.', data: entry });
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /accounting/journal-entries/{id}:
 *   get:
 *     summary: Get a journal entry with all lines
 *     tags: [Accounting]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/journal-entries/:id', authorize(...accountants), async (req, res, next) => {
  try {
    const entry = await JournalEntry.findOne({
      where: { id: req.params.id, organizationId: req.user.organizationId },
      include: [{ model: JournalLine, as: 'lines', include: [{ model: Account, as: 'account' }] }],
    });
    if (!entry) return notFoundResponse(res, 'Journal entry not found.');
    return successResponse(res, { data: entry });
  } catch (err) { next(err); }
});

// ─── Financial Statements ─────────────────────────────────────────────────────
/**
 * @swagger
 * /accounting/trial-balance:
 *   get:
 *     summary: Get trial balance
 *     tags: [Accounting]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/trial-balance', authorize(...accountants), async (req, res, next) => {
  try {
    const accountingService = (await import('../services/accountingService.js')).default;
    const data = await accountingService.getTrialBalance(req.user.organizationId);
    return successResponse(res, { data, message: `Trial balance — ${data.isBalanced ? '✓ Balanced' : '✗ OUT OF BALANCE'}` });
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /accounting/profit-loss:
 *   get:
 *     summary: Get income statement (profit and loss)
 *     tags: [Accounting]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/profit-loss', authorize(...accountants), async (req, res, next) => {
  try {
    const accountingService = (await import('../services/accountingService.js')).default;
    const data = await accountingService.getIncomeStatement(req.user.organizationId, req.query);
    return successResponse(res, { data, message: 'Income statement generated.' });
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /accounting/balance-sheet:
 *   get:
 *     summary: Get balance sheet (assets, liabilities, equity)
 *     tags: [Accounting]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/balance-sheet', authorize(...accountants), async (req, res, next) => {
  try {
    const assets      = await Account.findAll({ where: { organizationId: req.user.organizationId, type: 'asset',     isActive: true }, order: [['code', 'ASC']] });
    const liabilities = await Account.findAll({ where: { organizationId: req.user.organizationId, type: 'liability', isActive: true }, order: [['code', 'ASC']] });
    const equity      = await Account.findAll({ where: { organizationId: req.user.organizationId, type: 'equity',    isActive: true }, order: [['code', 'ASC']] });

    const totalAssets      = assets.reduce((s, a)      => s + parseFloat(a.balance || 0), 0);
    const totalLiabilities = liabilities.reduce((s, a) => s + parseFloat(a.balance || 0), 0);
    const totalEquity      = equity.reduce((s, a)      => s + parseFloat(a.balance || 0), 0);

    return successResponse(res, {
      data: {
        assets,      totalAssets,
        liabilities, totalLiabilities,
        equity,      totalEquity,
        isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01,
      },
      message: 'Balance sheet generated.',
    });
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /accounting/cash-flow:
 *   get:
 *     summary: Get simplified cash flow statement
 *     tags: [Accounting]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/cash-flow', authorize(...accountants), async (req, res, next) => {
  try {
    const { Op } = await import('sequelize');
    const { SavingsTransaction } = await import('../models/index.js');
    const where = { organizationId: req.user.organizationId, status: 'completed' };
    if (req.query.startDate) where.createdAt = { [Op.gte]: new Date(req.query.startDate) };
    if (req.query.endDate)   where.createdAt = { ...(where.createdAt || {}), [Op.lte]: new Date(req.query.endDate) };

    const txns = await SavingsTransaction.findAll({ where });
    const inflow  = txns.filter((t) => t.type === 'deposit').reduce((s, t) => s + parseFloat(t.amount), 0);
    const outflow = txns.filter((t) => t.type === 'withdrawal').reduce((s, t) => s + parseFloat(t.amount), 0);

    return successResponse(res, {
      data: { inflow, outflow, netCashFlow: inflow - outflow, period: { startDate: req.query.startDate, endDate: req.query.endDate } },
      message: 'Cash flow statement generated.',
    });
  } catch (err) { next(err); }
});

export default router;
