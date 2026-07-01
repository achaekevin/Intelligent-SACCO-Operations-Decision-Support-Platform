import { Router } from 'express';
import notificationController from '../controllers/notificationController.js';
import { authenticate, authorize, tenantIsolation } from '../middlewares/auth.js';
import { ROLES } from '../constants/index.js';

const router = Router();
router.use(authenticate, tenantIsolation);

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: In-app, email, and SMS notification management
 */

/** @swagger
 * /notifications:
 *   get:
 *     summary: List notifications for current user
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer } }
 *       - { in: query, name: limit, schema: { type: integer } }
 *       - { in: query, name: isRead, schema: { type: boolean } }
 *       - { in: query, name: type, schema: { type: string } }
 *       - { in: query, name: channel, schema: { type: string, enum: [in_app, email, sms] } }
 */
router.get('/',             notificationController.list);
router.get('/unread-count', notificationController.unreadCount);
router.get('/stats',        notificationController.getStats);
router.get('/sms-balance',  authorize(ROLES.SACCO_ADMIN), notificationController.getSmsBalance);

router.post('/',            authorize(ROLES.SACCO_ADMIN), notificationController.create);
router.post('/system',      authorize(ROLES.SACCO_ADMIN), notificationController.sendSystemNotification);

router.patch('/read-all',   notificationController.markAllRead);
router.patch('/:id/read',   notificationController.markRead);
router.delete('/:id',       notificationController.delete);

export default router;
