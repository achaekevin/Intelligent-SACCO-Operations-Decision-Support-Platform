import { Router } from 'express';
import dashboardController from '../controllers/dashboardController.js';
import { authenticate, tenantIsolation } from '../middlewares/auth.js';

const router = Router();
router.use(authenticate, tenantIsolation);

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard statistics and data
 */

/**
 * @swagger
 * /dashboard/admin/stats:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Dashboard]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/admin/stats', dashboardController.getAdminStats);

/**
 * @swagger
 * /dashboard/admin/transactions:
 *   get:
 *     summary: Get recent transactions for admin dashboard
 *     tags: [Dashboard]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/admin/transactions', dashboardController.getRecentTransactions);

/**
 * @swagger
 * /dashboard/member/stats:
 *   get:
 *     summary: Get member dashboard statistics
 *     tags: [Dashboard]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/member/stats', dashboardController.getMemberStats);

/**
 * @swagger
 * /dashboard/member/transactions:
 *   get:
 *     summary: Get recent transactions for member dashboard
 *     tags: [Dashboard]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/member/transactions', dashboardController.getMemberTransactions);

/**
 * @swagger
 * /dashboard/charts/savings-growth:
 *   get:
 *     summary: Get savings growth chart data
 *     tags: [Dashboard]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/charts/savings-growth', dashboardController.getSavingsGrowth);

/**
 * @swagger
 * /dashboard/charts/member-growth:
 *   get:
 *     summary: Get member growth chart data
 *     tags: [Dashboard]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/charts/member-growth', dashboardController.getMemberGrowth);

export default router;
