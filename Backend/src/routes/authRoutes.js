import { Router } from 'express';
import authController from '../controllers/authController.js';
import { authenticate } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { auditLog } from '../middlewares/auditLog.js';
import {
  registerOrgSchema, loginSchema, forgotPasswordSchema,
  resetPasswordSchema, changePasswordSchema, verifyEmailSchema,
} from '../validators/authValidator.js';
import rateLimit from 'express-rate-limit';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' },
});

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and account management
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new SACCO organization with admin account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orgName, orgCode, orgEmail, orgPhone, adminFirstName, adminLastName, adminEmail, adminPhone, adminPassword]
 *             properties:
 *               orgName: { type: string, example: "Umoja SACCO" }
 *               orgCode: { type: string, example: "UMOJA001" }
 *               orgEmail: { type: string, format: email }
 *               orgPhone: { type: string, example: "+254712345678" }
 *               adminFirstName: { type: string }
 *               adminLastName: { type: string }
 *               adminEmail: { type: string, format: email }
 *               adminPhone: { type: string }
 *               adminPassword: { type: string, format: password }
 *     responses:
 *       201: { description: Organization registered successfully }
 *       409: { description: Duplicate email or code }
 */
router.post('/register', validate(registerOrgSchema), auditLog('register', 'auth'), authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login successful, returns access + refresh tokens }
 *       401: { description: Invalid credentials or account locked }
 */
router.post('/login', loginLimiter, validate(loginSchema), auditLog('login', 'auth'), authController.login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout and invalidate tokens
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Logged out successfully }
 */
router.post('/logout', authenticate, auditLog('logout', 'auth'), authController.logout);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token using refresh token
 *     tags: [Auth]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId: { type: string, format: uuid }
 *               refreshToken: { type: string }
 *     responses:
 *       200: { description: New access token issued }
 *       401: { description: Invalid refresh token }
 */
router.post('/refresh', authController.refresh);

/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *     summary: Verify email with token from email link
 *     tags: [Auth]
 */
router.post('/verify-email', validate(verifyEmailSchema), authController.verifyEmail);

/**
 * @swagger
 * /auth/resend-verification:
 *   post:
 *     summary: Resend email verification link
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 */
router.post('/resend-verification', authenticate, authController.resendVerification);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset email
 *     tags: [Auth]
 */
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password with token
 *     tags: [Auth]
 */
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Change password (requires authentication)
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 */
router.post('/change-password', authenticate, validate(changePasswordSchema), auditLog('password_change', 'auth'), authController.changePassword);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current authenticated user profile
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/me', authenticate, authController.me);

export default router;
