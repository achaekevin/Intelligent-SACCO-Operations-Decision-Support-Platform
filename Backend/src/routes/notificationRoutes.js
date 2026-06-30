import { Router } from 'express';
import notificationController from '../controllers/notificationController.js';
import { authenticate, tenantIsolation } from '../middlewares/auth.js';

const router = Router();
router.use(authenticate, tenantIsolation);

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: In-app notification management
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
 */
router.get('/',             notificationController.list);
router.get('/unread-count', notificationController.unreadCount);
router.patch('/read-all',   notificationController.markAllRead);
router.patch('/:id/read',   notificationController.markRead);
router.delete('/:id',       notificationController.delete);

export default router;
