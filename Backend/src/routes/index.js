import { Router } from 'express';
import authRoutes from './authRoutes.js';
import organizationRoutes from './organizationRoutes.js';
import branchRoutes from './branchRoutes.js';
import userRoutes from './userRoutes.js';
import memberRoutes from './memberRoutes.js';
import savingsRoutes from './savingsRoutes.js';
import loanRoutes from './loanRoutes.js';
import accountingRoutes from './accountingRoutes.js';
import reportRoutes from './reportRoutes.js';
import mpesaRoutes from './mpesaRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import auditLogRoutes from './auditLogRoutes.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'SACCO Management System API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

router.use('/auth',          authRoutes);
router.use('/organizations', organizationRoutes);
router.use('/branches',      branchRoutes);
router.use('/users',         userRoutes);
router.use('/members',       memberRoutes);
router.use('/savings',       savingsRoutes);
router.use('/loans',         loanRoutes);
router.use('/accounting',    accountingRoutes);
router.use('/reports',       reportRoutes);
router.use('/mpesa',         mpesaRoutes);
router.use('/notifications', notificationRoutes);
router.use('/audit-logs',    auditLogRoutes);

export default router;
