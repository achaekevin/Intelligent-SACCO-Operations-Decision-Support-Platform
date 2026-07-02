import { Router } from 'express';
import tellerController from '../controllers/tellerController.js';
import { authenticate, authorize, tenantIsolation } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import Joi from 'joi';
import { ROLES } from '../constants/index.js';

const router = Router();
router.use(authenticate, tenantIsolation);

const tellerRoles = [ROLES.SACCO_ADMIN, ROLES.CASHIER];

// Validation schemas
const cashCountingSchema = Joi.object({
  date: Joi.date().required(),
  denominations: Joi.object({
    '1000': Joi.number().min(0).default(0),
    '500': Joi.number().min(0).default(0),
    '200': Joi.number().min(0).default(0),
    '100': Joi.number().min(0).default(0),
    '50': Joi.number().min(0).default(0),
    '20': Joi.number().min(0).default(0),
    '10': Joi.number().min(0).default(0),
    '5': Joi.number().min(0).default(0),
    '1': Joi.number().min(0).default(0),
  }).required(),
  totalCounted: Joi.number().min(0).required(),
  notes: Joi.string().max(500).optional().allow(''),
});

const reviewTransactionSchema = Joi.object({
  action: Joi.string().valid('approve', 'reject').required(),
  notes: Joi.string().max(500).optional().allow(''),
});

/**
 * @swagger
 * tags:
 *   name: Teller
 *   description: Teller operations and reports
 */

/**
 * @swagger
 * /teller/end-of-day-report/pdf:
 *   get:
 *     summary: Generate End of Day Report (PDF)
 *     tags: [Teller]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/end-of-day-report/pdf',
  authorize(...tellerRoles),
  tellerController.generateEndOfDayReport
);

/**
 * @swagger
 * /teller/end-of-day-report:
 *   get:
 *     summary: Get End of Day Report Data (JSON)
 *     tags: [Teller]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/end-of-day-report',
  authorize(...tellerRoles),
  tellerController.getEndOfDayReport
);

/**
 * @swagger
 * /teller/cash-counting:
 *   post:
 *     summary: Submit Cash Counting (Reconciliation)
 *     tags: [Teller]
 *     security: [{ bearerAuth: [] }]
 */
router.post('/cash-counting',
  authorize(...tellerRoles),
  validate(cashCountingSchema),
  tellerController.submitCashCounting
);

/**
 * @swagger
 * /teller/transactions/{id}/review:
 *   patch:
 *     summary: Approve or Reject Transaction
 *     tags: [Teller]
 *     security: [{ bearerAuth: [] }]
 */
router.patch('/transactions/:id/review',
  authorize(...tellerRoles),
  validate(reviewTransactionSchema),
  tellerController.reviewTransaction
);

/**
 * @swagger
 * /teller/daily-targets:
 *   get:
 *     summary: Get Daily Target Progress
 *     tags: [Teller]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/daily-targets',
  authorize(...tellerRoles),
  tellerController.getDailyTargets
);

/**
 * @swagger
 * /teller/performance:
 *   get:
 *     summary: Get Teller Performance Metrics
 *     tags: [Teller]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/performance',
  authorize(...tellerRoles),
  tellerController.getPerformanceMetrics
);

export default router;
