import { Router } from 'express';
import savingsController from '../controllers/savingsController.js';
import { authenticate, authorize, tenantIsolation } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { auditLog } from '../middlewares/auditLog.js';
import {
  createAccountSchema, depositSchema, withdrawalSchema,
  transferSchema, reversalSchema, transactionQuerySchema,
} from '../validators/savingsValidator.js';
import { ROLES } from '../constants/index.js';

const router = Router();
router.use(authenticate, tenantIsolation);

const tellers = [ROLES.SUPER_ADMIN, ROLES.SACCO_ADMIN, ROLES.BRANCH_MANAGER, ROLES.CASHIER, ROLES.ACCOUNTANT];

/**
 * @swagger
 * tags:
 *   name: Savings
 *   description: Savings accounts and transactions
 */

// ─── Accounts ─────────────────────────────────────────────────
/**
 * @swagger
 * /savings/accounts:
 *   get:
 *     summary: List all savings accounts
 *     tags: [Savings]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer } }
 *       - { in: query, name: limit, schema: { type: integer } }
 *       - { in: query, name: accountType, schema: { type: string, enum: [ordinary, share_capital, fixed_deposit] } }
 *       - { in: query, name: status, schema: { type: string, enum: [active, dormant, closed, frozen] } }
 *       - { in: query, name: search, schema: { type: string } }
 */
router.get('/accounts', savingsController.listAccounts);

/**
 * @swagger
 * /savings/accounts:
 *   post:
 *     summary: Open a new savings account for a member
 *     tags: [Savings]
 *     security: [{ bearerAuth: [] }]
 */
router.post('/accounts',
  authorize(...tellers),
  validate(createAccountSchema),
  auditLog('create', 'savings'),
  savingsController.createAccount,
);

/**
 * @swagger
 * /savings/accounts/{id}:
 *   get:
 *     summary: Get savings account details
 *     tags: [Savings]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/accounts/:id', savingsController.getAccountById);

/**
 * @swagger
 * /savings/accounts/{id}/transactions:
 *   get:
 *     summary: Get transactions for a specific savings account
 *     tags: [Savings]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/accounts/:id/transactions',
  validate(transactionQuerySchema, 'query'),
  savingsController.getAccountTransactions,
);

/**
 * @swagger
 * /savings/members/{memberId}/accounts:
 *   get:
 *     summary: Get all savings accounts for a member
 *     tags: [Savings]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/members/:memberId/accounts', savingsController.getMemberAccounts);

// ─── Transactions ──────────────────────────────────────────────
/**
 * @swagger
 * /savings/deposit:
 *   post:
 *     summary: Process a deposit into a savings account
 *     tags: [Savings]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [accountId, amount]
 *             properties:
 *               accountId: { type: string, format: uuid }
 *               amount: { type: number, minimum: 1 }
 *               paymentMethod: { type: string, enum: [cash, mpesa, bank_transfer, cheque] }
 *               externalReference: { type: string }
 *               description: { type: string }
 */
router.post('/deposit',
  authorize(...tellers),
  validate(depositSchema),
  auditLog('deposit', 'savings'),
  savingsController.deposit,
);

/**
 * @swagger
 * /savings/withdraw:
 *   post:
 *     summary: Process a withdrawal from a savings account
 *     tags: [Savings]
 *     security: [{ bearerAuth: [] }]
 */
router.post('/withdraw',
  authorize(...tellers),
  validate(withdrawalSchema),
  auditLog('withdraw', 'savings'),
  savingsController.withdraw,
);

/**
 * @swagger
 * /savings/transfer:
 *   post:
 *     summary: Transfer funds between savings accounts
 *     tags: [Savings]
 *     security: [{ bearerAuth: [] }]
 */
router.post('/transfer',
  authorize(...tellers),
  validate(transferSchema),
  auditLog('transfer', 'savings'),
  savingsController.transfer,
);

/**
 * @swagger
 * /savings/transactions:
 *   get:
 *     summary: List all savings transactions
 *     tags: [Savings]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/transactions',
  validate(transactionQuerySchema, 'query'),
  savingsController.listTransactions,
);

/**
 * @swagger
 * /savings/transactions/{transactionId}/reverse:
 *   post:
 *     summary: Reverse a savings transaction
 *     tags: [Savings]
 *     security: [{ bearerAuth: [] }]
 */
router.post('/transactions/:transactionId/reverse',
  authorize(ROLES.SUPER_ADMIN, ROLES.SACCO_ADMIN, ROLES.ACCOUNTANT),
  validate(reversalSchema),
  auditLog('update', 'savings'),
  savingsController.reverseTransaction,
);

export default router;
