import { Router } from 'express';
import reportController from '../controllers/reportController.js';
import { authenticate, tenantIsolation } from '../middlewares/auth.js';
import { auditLog } from '../middlewares/auditLog.js';
import { ROLES } from '../constants/index.js';

const router = Router();
router.use(authenticate, tenantIsolation);

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Generate and export reports (JSON / CSV / Excel / PDF)
 */

router.get('/', reportController.list);

/**
 * @swagger
 * /reports/members:
 *   get:
 *     summary: Generate members report
 *     tags: [Reports]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: format, schema: { type: string, enum: [json, csv, excel, pdf] }, description: "Export format (default: json)" }
 *       - { in: query, name: status, schema: { type: string } }
 *       - { in: query, name: branchId, schema: { type: string, format: uuid } }
 *       - { in: query, name: startDate, schema: { type: string, format: date } }
 *       - { in: query, name: endDate, schema: { type: string, format: date } }
 */
router.get('/members',  auditLog('export', 'report'), reportController.membersReport);
router.get('/savings',  auditLog('export', 'report'), reportController.savingsReport);
router.get('/loans',    auditLog('export', 'report'), reportController.loansReport);
router.get('/transactions', auditLog('export', 'report'), reportController.transactionsReport);
router.get('/statement/:memberId', auditLog('export', 'report'), reportController.memberStatement);
router.get('/statement', auditLog('export', 'report'), reportController.memberStatement); // For current user
router.get('/financial', auditLog('export', 'report'), reportController.financialReport);

export default router;
