import { Router } from 'express';
import branchController from '../controllers/branchController.js';
import { authenticate, authorize, tenantIsolation } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { auditLog } from '../middlewares/auditLog.js';
import { createBranchSchema, updateBranchSchema, assignManagerSchema } from '../validators/branchValidator.js';
import { ROLES } from '../constants/index.js';

const router = Router();
router.use(authenticate, tenantIsolation);

/**
 * @swagger
 * tags:
 *   name: Branches
 *   description: Branch management
 */

/**
 * @swagger
 * /branches:
 *   get:
 *     summary: List all branches in the organization
 *     tags: [Branches]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [active, inactive] }
 *     responses:
 *       200: { description: List of branches }
 */
router.get('/', branchController.list);

/**
 * @swagger
 * /branches:
 *   post:
 *     summary: Create a new branch
 *     tags: [Branches]
 *     security: [{ bearerAuth: [] }]
 */
router.post('/',
  authorize(ROLES.SUPER_ADMIN, ROLES.SACCO_ADMIN),
  validate(createBranchSchema),
  auditLog('create', 'branch'),
  branchController.create,
);

/**
 * @swagger
 * /branches/{id}:
 *   get:
 *     summary: Get branch by ID
 *     tags: [Branches]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/:id', branchController.getById);

/**
 * @swagger
 * /branches/{id}:
 *   put:
 *     summary: Update a branch
 *     tags: [Branches]
 *     security: [{ bearerAuth: [] }]
 */
router.put('/:id',
  authorize(ROLES.SUPER_ADMIN, ROLES.SACCO_ADMIN),
  validate(updateBranchSchema),
  auditLog('update', 'branch'),
  branchController.update,
);

/**
 * @swagger
 * /branches/{id}:
 *   delete:
 *     summary: Delete a branch (only if no members)
 *     tags: [Branches]
 *     security: [{ bearerAuth: [] }]
 */
router.delete('/:id',
  authorize(ROLES.SUPER_ADMIN, ROLES.SACCO_ADMIN),
  auditLog('delete', 'branch'),
  branchController.delete,
);

/**
 * @swagger
 * /branches/{id}/stats:
 *   get:
 *     summary: Get branch statistics
 *     tags: [Branches]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/:id/stats', branchController.getStats);

/**
 * @swagger
 * /branches/{id}/assign-manager:
 *   patch:
 *     summary: Assign a branch manager
 *     tags: [Branches]
 *     security: [{ bearerAuth: [] }]
 */
router.patch('/:id/assign-manager',
  authorize(ROLES.SUPER_ADMIN, ROLES.SACCO_ADMIN),
  validate(assignManagerSchema),
  auditLog('update', 'branch'),
  branchController.assignManager,
);

export default router;
