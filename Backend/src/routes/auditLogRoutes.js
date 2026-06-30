import { Router } from 'express';
import auditLogController from '../controllers/auditLogController.js';
import { authenticate, authorize, tenantIsolation } from '../middlewares/auth.js';
import { ROLES } from '../constants/index.js';

const router = Router();
router.use(authenticate, tenantIsolation);

const auditors = [ROLES.SACCO_ADMIN, ROLES.AUDITOR];

/**
 * @swagger
 * tags:
 *   name: Audit
 *   description: Immutable audit trail of all system actions
 */

/**
 * @swagger
 * /audit-logs:
 *   get:
 *     summary: List audit log entries with filters
 *     tags: [Audit]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page,      schema: { type: integer } }
 *       - { in: query, name: limit,     schema: { type: integer } }
 *       - { in: query, name: userId,    schema: { type: string, format: uuid } }
 *       - { in: query, name: action,    schema: { type: string } }
 *       - { in: query, name: module,    schema: { type: string } }
 *       - { in: query, name: startDate, schema: { type: string, format: date } }
 *       - { in: query, name: endDate,   schema: { type: string, format: date } }
 */
router.get('/',                   authorize(...auditors), auditLogController.list);
router.get('/:id',                authorize(...auditors), auditLogController.getById);
router.get('/user/:userId',       authorize(...auditors), auditLogController.getByUser);

export default router;
