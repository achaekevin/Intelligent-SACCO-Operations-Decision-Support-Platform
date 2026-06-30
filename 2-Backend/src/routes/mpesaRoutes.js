import { Router } from 'express';
import { authenticate, tenantIsolation } from '../middlewares/auth.js';
import { MpesaTransaction } from '../models/index.js';
import { successResponse, createdResponse, notFoundResponse } from '../utils/response.js';
import { ROLES } from '../constants/index.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: MpeSa
 *   description: Safaricom Daraja API integration
 */

/**
 * @swagger
 * /mpesa/stk-push:
 *   post:
 *     summary: Initiate M-Pesa STK Push payment
 *     tags: [MpeSa]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phoneNumber, amount, accountRef]
 *             properties:
 *               phoneNumber: { type: string, example: "254712345678" }
 *               amount: { type: number, example: 5000 }
 *               accountRef: { type: string, example: "MBR-20240001" }
 *               description: { type: string, example: "Savings deposit" }
 */
router.post('/stk-push', authenticate, tenantIsolation, async (req, res, next) => {
  try {
    const mpesaService = (await import('../services/mpesaService.js')).default;
    const { phoneNumber, amount, accountRef, description } = req.body;

    const stkResponse = await mpesaService.stkPush({ phoneNumber, amount, accountRef, description });

    // Record pending transaction
    const record = await MpesaTransaction.create({
      organizationId: req.user.organizationId,
      phoneNumber,
      amount,
      checkoutRequestId: stkResponse.CheckoutRequestID,
      merchantRequestId: stkResponse.MerchantRequestID,
      transactionType: 'stk_push',
      status: 'pending',
    });

    return createdResponse(res, {
      message: 'STK Push sent. Check your phone to complete payment.',
      data: { transactionId: record.id, checkoutRequestId: stkResponse.CheckoutRequestID },
    });
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /mpesa/callback:
 *   post:
 *     summary: M-Pesa payment callback (called by Safaricom servers)
 *     tags: [MpeSa]
 */
router.post('/callback', async (req, res, next) => {
  try {
    // Must respond quickly (within 5s) or Safaricom will retry
    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });

    const mpesaService = (await import('../services/mpesaService.js')).default;
    // Find organization by shortcode / implement your routing logic here
    const orgId = req.headers['x-organization-id'];
    if (orgId) {
      await mpesaService.handleCallback(orgId, req.body);
    }
  } catch (err) {
    // Don't expose errors to Safaricom; already responded 200
    const logger = (await import('../utils/logger.js')).default;
    logger.error('M-Pesa callback error:', err.message);
  }
});

/**
 * @swagger
 * /mpesa/status/{checkoutRequestId}:
 *   get:
 *     summary: Query M-Pesa transaction status
 *     tags: [MpeSa]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/status/:checkoutRequestId', authenticate, tenantIsolation, async (req, res, next) => {
  try {
    const record = await MpesaTransaction.findOne({
      where: { checkoutRequestId: req.params.checkoutRequestId, organizationId: req.user.organizationId },
    });
    if (!record) return notFoundResponse(res, 'Transaction not found.');
    return successResponse(res, { data: record });
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /mpesa/transactions:
 *   get:
 *     summary: List all M-Pesa transactions
 *     tags: [MpeSa]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/transactions', authenticate, tenantIsolation, async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const where = { organizationId: req.user.organizationId };
    if (req.query.status) where.status = req.query.status;

    const { count, rows } = await MpesaTransaction.findAndCountAll({
      where, limit, offset: (page - 1) * limit,
      order: [['createdAt', 'DESC']],
    });
    const { paginatedResponse } = await import('../utils/response.js');
    return paginatedResponse(res, { data: rows, total: count, page, limit });
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /mpesa/b2c:
 *   post:
 *     summary: Initiate B2C payment (loan disbursement to member phone)
 *     tags: [MpeSa]
 *     security: [{ bearerAuth: [] }]
 */
router.post('/b2c', authenticate, tenantIsolation, async (req, res, next) => {
  try {
    const mpesaService = (await import('../services/mpesaService.js')).default;
    const { phoneNumber, amount, remarks, occasion } = req.body;
    const result = await mpesaService.b2cPayment({ phoneNumber, amount, remarks, occasion });
    return createdResponse(res, { message: 'B2C payment initiated.', data: result });
  } catch (err) { next(err); }
});

export default router;
