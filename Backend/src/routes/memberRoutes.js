import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import memberController from '../controllers/memberController.js';
import { authenticate, authorize, tenantIsolation } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { auditLog } from '../middlewares/auditLog.js';
import {
  registerMemberSchema, updateMemberSchema,
  addNextOfKinSchema, suspendMemberSchema, memberListQuerySchema,
} from '../validators/memberValidator.js';
import { ROLES } from '../constants/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads/documents'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: (parseInt(process.env.UPLOAD_MAX_SIZE_MB) || 5) * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|pdf/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.test(ext)) return cb(null, true);
    cb(new Error('Only JPEG, PNG, and PDF files are allowed.'));
  },
});

const router = Router();
router.use(authenticate, tenantIsolation);

const staffRoles = [ROLES.SACCO_ADMIN, ROLES.LOAN_OFFICER, ROLES.CASHIER];

/**
 * @swagger
 * tags:
 *   name: Members
 *   description: Member registration and management
 */

/**
 * @swagger
 * /members:
 *   get:
 *     summary: List members with pagination, search, and filters
 *     tags: [Members]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [active, inactive, suspended, pending] }
 *       - in: query
 *         name: branchId
 *         schema: { type: string, format: uuid }
 */
router.get('/', validate(memberListQuerySchema, 'query'), memberController.list);

/** @swagger
 * /members/stats:
 *   get:
 *     summary: Get member statistics for the organization
 *     tags: [Members]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/stats', memberController.getStats);

/**
 * @swagger
 * /members:
 *   post:
 *     summary: Register a new member
 *     tags: [Members]
 *     security: [{ bearerAuth: [] }]
 */
router.post('/',
  authorize(...staffRoles),
  validate(registerMemberSchema),
  auditLog('create', 'member'),
  memberController.register,
);

/**
 * @swagger
 * /members/{id}:
 *   get:
 *     summary: Get member details with accounts and documents
 *     tags: [Members]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/:id', memberController.getById);

/**
 * @swagger
 * /members/{id}:
 *   put:
 *     summary: Update member details
 *     tags: [Members]
 *     security: [{ bearerAuth: [] }]
 */
router.put('/:id',
  authorize(...staffRoles),
  validate(updateMemberSchema),
  auditLog('update', 'member'),
  memberController.update,
);

/**
 * @swagger
 * /members/{id}/activate:
 *   patch:
 *     summary: Activate a pending/inactive member
 *     tags: [Members]
 *     security: [{ bearerAuth: [] }]
 */
router.patch('/:id/activate',
  authorize(ROLES.SACCO_ADMIN),
  auditLog('approve', 'member'),
  memberController.activate,
);

/**
 * @swagger
 * /members/{id}/suspend:
 *   patch:
 *     summary: Suspend a member account
 *     tags: [Members]
 *     security: [{ bearerAuth: [] }]
 */
router.patch('/:id/suspend',
  authorize(ROLES.SACCO_ADMIN),
  validate(suspendMemberSchema),
  auditLog('update', 'member'),
  memberController.suspend,
);

/**
 * @swagger
 * /members/{id}/next-of-kin:
 *   post:
 *     summary: Add next of kin for a member
 *     tags: [Members]
 *     security: [{ bearerAuth: [] }]
 */
router.post('/:id/next-of-kin',
  authorize(...staffRoles),
  validate(addNextOfKinSchema),
  memberController.addNextOfKin,
);

/**
 * @swagger
 * /members/{id}/documents:
 *   post:
 *     summary: Upload a member document
 *     tags: [Members]
 *     security: [{ bearerAuth: [] }]
 */
router.post('/:id/documents',
  authorize(...staffRoles),
  upload.single('document'),
  memberController.uploadDocument,
);

/**
 * @swagger
 * /members/{id}/statement:
 *   get:
 *     summary: Get member account statement
 *     tags: [Members]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 */
router.get('/:id/statement', memberController.getStatement);

export default router;
