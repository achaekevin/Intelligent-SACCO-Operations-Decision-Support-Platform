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
router.get('/financial', async (req, res, next) => {
  try {
    const accountingService = (await import('../services/accountingService.js')).default;
    const [trialBalance, incomeStatement] = await Promise.all([
      accountingService.getTrialBalance(req.user.organizationId),
      accountingService.getIncomeStatement(req.user.organizationId),
    ]);
    const { successResponse } = await import('../utils/response.js');
    return successResponse(res, { data: { trialBalance, incomeStatement }, message: 'Financial report generated.' });
  } catch (err) { next(err); }
});

export default router;
