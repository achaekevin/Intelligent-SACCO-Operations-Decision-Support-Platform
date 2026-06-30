import { Router } from 'express';
import organizationController from '../controllers/organizationController.js';
import { authenticate, authorize, tenantIsolation } from '../middlewares/auth.js';
import { auditLog } from '../middlewares/auditLog.js';
import { ROLES } from '../constants/index.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Organizations
 *   description: SACCO organization management
 */

/**
 * @swagger
 * /organizations:
 *   get:
 *     summary: List all organizations (Super Admin only)
 *     tags: [Organizations]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer } }
 *       - { in: query, name: limit, schema: { type: integer } }
 *       - { in: query, name: status, schema: { type: string, enum: [active, suspended, trial, expired] } }
 *     responses:
 *       200: { description: Paginated list of organizations }
 *       403: { description: Forbidden — Super Admin only }
 */
router.get('/',
  authenticate,
  authorize(ROLES.SACCO_ADMIN),
  organizationController.list,
);

/**
 * @swagger
 * /organizations/me:
 *   get:
 *     summary: Get the current user's organization
 *     tags: [Organizations]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Organization details }
 */
router.get('/me',
  authenticate,
  tenantIsolation,
  organizationController.getMyOrganization,
);

/**
 * @swagger
 * /organizations/me/stats:
 *   get:
 *     summary: Get dashboard statistics for the current organization
 *     tags: [Organizations]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/me/stats',
  authenticate,
  tenantIsolation,
  organizationController.getStats,
);

/**
 * @swagger
 * /organizations/me/settings:
 *   patch:
 *     summary: Update organization settings (currency, timezone, loan approval levels, etc.)
 *     tags: [Organizations]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currency: { type: string, example: KES }
 *               timezone: { type: string, example: Africa/Nairobi }
 *               interestMethod: { type: string, enum: [flat, reducing_balance] }
 *               enableMpesa: { type: boolean }
 *               loanApprovalLevels: { type: integer, minimum: 1, maximum: 3 }
 */
router.patch('/me/settings',
  authenticate,
  tenantIsolation,
  authorize(ROLES.SACCO_ADMIN),
  auditLog('update', 'organization'),
  organizationController.updateSettings,
);

/**
 * @swagger
 * /organizations/me:
 *   put:
 *     summary: Update current organization profile
 *     tags: [Organizations]
 *     security: [{ bearerAuth: [] }]
 */
router.put('/me',
  authenticate,
  tenantIsolation,
  authorize(ROLES.SACCO_ADMIN),
  auditLog('update', 'organization'),
  organizationController.update,
);

/**
 * @swagger
 * /organizations/{id}:
 *   get:
 *     summary: Get organization by ID (Super Admin only)
 *     tags: [Organizations]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/:id',
  authenticate,
  authorize(ROLES.SACCO_ADMIN),
  organizationController.getById,
);

/**
 * @swagger
 * /organizations/{id}:
 *   put:
 *     summary: Update an organization (Super Admin only)
 *     tags: [Organizations]
 *     security: [{ bearerAuth: [] }]
 */
router.put('/:id',
  authenticate,
  authorize(ROLES.SACCO_ADMIN),
  auditLog('update', 'organization'),
  organizationController.update,
);

/**
 * @swagger
 * /organizations/{id}/status:
 *   patch:
 *     summary: Update organization status (activate, suspend, expire)
 *     tags: [Organizations]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string, enum: [active, suspended, trial, expired] }
 */
router.patch('/:id/status',
  authenticate,
  authorize(ROLES.SACCO_ADMIN),
  auditLog('update', 'organization'),
  organizationController.updateStatus,
);

export default router;
