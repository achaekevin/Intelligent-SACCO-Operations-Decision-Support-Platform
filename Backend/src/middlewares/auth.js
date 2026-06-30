import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';
import { redisGet } from '../config/redis.js';

/**
 * Verifies JWT access token from Authorization: Bearer <token> header.
 * Attaches decoded user payload to req.user.
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Access token required');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // Check if token has been blacklisted (e.g. after logout)
    const isBlacklisted = await redisGet(`blacklist:${token}`);
    if (isBlacklisted) {
      throw new UnauthorizedError('Token has been invalidated. Please log in again.');
    }

    req.user = decoded;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Role-based access control middleware factory.
 * Usage: authorize(ROLES.SACCO_ADMIN, ROLES.LOAN_OFFICER)
 */
export const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) return next(new UnauthorizedError());
  if (!allowedRoles.includes(req.user.role)) {
    return next(new ForbiddenError(`Access denied. Required roles: ${allowedRoles.join(', ')}`));
  }
  next();
};

/**
 * Permission-based authorization middleware factory.
 * Usage: requirePermission(PERMISSIONS.LOAN_APPROVE)
 */
export const requirePermission = (permission) => (req, res, next) => {
  if (!req.user) return next(new UnauthorizedError());
  const userPermissions = req.user.permissions || [];
  if (!userPermissions.includes(permission) && req.user.role !== 'super_admin') {
    return next(new ForbiddenError(`Missing permission: ${permission}`));
  }
  next();
};

/**
 * Tenant isolation middleware.
 * Ensures users can only access data from their own organization.
 */
export const tenantIsolation = (req, res, next) => {
  if (!req.user?.organizationId && req.user?.role !== 'super_admin') {
    return next(new UnauthorizedError('Organization context required'));
  }
  // Attach organizationId to body/query for downstream use
  req.organizationId = req.user.organizationId;
  next();
};
