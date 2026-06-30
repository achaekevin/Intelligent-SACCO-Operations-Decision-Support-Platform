import { Router } from 'express';
import { User, Role, Permission, Branch } from '../models/index.js';
import { authenticate, authorize, tenantIsolation } from '../middlewares/auth.js';
import { auditLog } from '../middlewares/auditLog.js';
import validate from '../middlewares/validate.js';
import { createdResponse, successResponse, paginatedResponse, notFoundResponse } from '../utils/response.js';
import { ConflictError, NotFoundError } from '../utils/errors.js';
import { ROLES } from '../constants/index.js';
import tokenService from '../services/tokenService.js';
import emailService from '../services/emailService.js';
import logger from '../utils/logger.js';
import Joi from 'joi';

const createUserSchema = Joi.object({
  firstName:   Joi.string().min(2).max(100).required(),
  lastName:    Joi.string().min(2).max(100).required(),
  email:       Joi.string().email().required(),
  phone:       Joi.string().pattern(/^\+?[\d\s\-]{9,15}$/).required(),
  role:        Joi.string().valid(...Object.values(ROLES)).required(),
  branchId:    Joi.string().uuid().optional().allow(null),
  password:    Joi.string().min(8).optional(),
});

const updateUserSchema = Joi.object({
  firstName: Joi.string().min(2).max(100).optional(),
  lastName:  Joi.string().min(2).max(100).optional(),
  phone:     Joi.string().pattern(/^\+?[\d\s\-]{9,15}$/).optional(),
  role:      Joi.string().valid(...Object.values(ROLES)).optional(),
  branchId:  Joi.string().uuid().optional().allow(null),
  status:    Joi.string().valid('active', 'inactive', 'suspended').optional(),
});

const router = Router();
router.use(authenticate, tenantIsolation);

const admins = [ROLES.SACCO_ADMIN];

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Staff user management (create, update roles, suspend)
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: List all staff users in the organization
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/', authorize(...admins), async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const where = { organizationId: req.user.organizationId };
    if (req.query.role)     where.role   = req.query.role;
    if (req.query.status)   where.status = req.query.status;
    if (req.query.branchId) where.branchId = req.query.branchId;

    const { count, rows } = await User.findAndCountAll({
      where, limit, offset: (page - 1) * limit,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['password', 'emailVerificationToken', 'passwordResetToken', 'twoFactorSecret'] },
      include: [{ model: Branch, as: 'branch', attributes: ['id', 'name', 'code'] }],
    });
    return paginatedResponse(res, { data: rows, total: count, page, limit });
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a staff user (cashier, loan officer, accountant, etc.)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email, phone, role]
 *             properties:
 *               firstName: { type: string }
 *               lastName:  { type: string }
 *               email:     { type: string, format: email }
 *               phone:     { type: string }
 *               role:      { type: string, enum: [sacco_admin, loan_officer, cashier, auditor] }
 *               branchId:  { type: string, format: uuid }
 */
router.post('/', authorize(...admins), validate(createUserSchema), auditLog('create', 'user'), async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, role, branchId, password } = req.body;

    const existing = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existing) throw new ConflictError('A user with this email already exists.');

    const tempPassword = password || `Temp@${Math.random().toString(36).slice(-8)}`;

    // Find or create the role record
    const [roleRecord] = await Role.findOrCreate({
      where: { slug: role, organizationId: req.user.organizationId },
      defaults: { name: role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()), slug: role, isSystem: true },
    });

    const user = await User.create({
      organizationId: req.user.organizationId,
      branchId: branchId || null,
      roleId: roleRecord.id,
      firstName, lastName, phone,
      email: email.toLowerCase(),
      password: tempPassword,
      role,
      isEmailVerified: false,
      mustChangePassword: true,
      status: 'active',
    });

    // Send welcome email with temp password
    emailService.sendWelcomeEmail(user, tempPassword).catch((e) =>
      logger.error('Welcome email failed:', e.message)
    );

    const safeUser = user.toSafeJSON();
    logger.info(`Staff user created: ${email} with role ${role} by ${req.user.email}`);
    return createdResponse(res, { message: `User created. Temporary password sent to ${email}.`, data: safeUser });
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a staff user by ID
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/:id', authorize(...admins), async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { id: req.params.id, organizationId: req.user.organizationId },
      attributes: { exclude: ['password', 'emailVerificationToken', 'passwordResetToken', 'twoFactorSecret'] },
      include: [
        { model: Role, as: 'roleData', include: [{ model: Permission, as: 'permissions', through: { attributes: [] } }] },
        { model: Branch, as: 'branch', attributes: ['id', 'name', 'code'] },
      ],
    });
    if (!user) return notFoundResponse(res, 'User not found.');
    return successResponse(res, { data: user });
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update a staff user (role, branch, status)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 */
router.put('/:id', authorize(...admins), validate(updateUserSchema), auditLog('update', 'user'), async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.params.id, organizationId: req.user.organizationId } });
    if (!user) return notFoundResponse(res, 'User not found.');
    await user.update(req.body);
    // Clear cached permissions if role changed
    if (req.body.role) await tokenService.clearCachedPermissions(user.id);
    return successResponse(res, { message: 'User updated.', data: user.toSafeJSON() });
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /users/{id}/suspend:
 *   patch:
 *     summary: Suspend a staff user
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 */
router.patch('/:id/suspend', authorize(...admins), auditLog('update', 'user'), async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.params.id, organizationId: req.user.organizationId } });
    if (!user) return notFoundResponse(res, 'User not found.');
    if (user.id === req.user.id) return res.status(400).json({ success: false, message: 'You cannot suspend yourself.', errors: [] });
    await user.update({ status: 'suspended' });
    await tokenService.clearCachedPermissions(user.id);
    return successResponse(res, { message: 'User suspended.', data: user.toSafeJSON() });
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /users/{id}/activate:
 *   patch:
 *     summary: Reactivate a suspended user
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 */
router.patch('/:id/activate', authorize(...admins), auditLog('update', 'user'), async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.params.id, organizationId: req.user.organizationId } });
    if (!user) return notFoundResponse(res, 'User not found.');
    await user.update({ status: 'active', lockedUntil: null, loginAttempts: 0 });
    return successResponse(res, { message: 'User activated.', data: user.toSafeJSON() });
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Soft-delete a staff user
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 */
router.delete('/:id', authorize(ROLES.SACCO_ADMIN), auditLog('delete', 'user'), async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.params.id, organizationId: req.user.organizationId } });
    if (!user) return notFoundResponse(res, 'User not found.');
    if (user.id === req.user.id) return res.status(400).json({ success: false, message: 'You cannot delete yourself.', errors: [] });
    await user.destroy();
    await tokenService.clearCachedPermissions(user.id);
    return successResponse(res, { message: 'User deleted.' });
  } catch (err) { next(err); }
});

export default router;
