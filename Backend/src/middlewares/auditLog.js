import { AuditLog } from '../models/index.js';
import logger from '../utils/logger.js';

/**
 * Audit logging middleware factory.
 *
 * Usage:
 *   router.post('/login', auditLog('login', 'auth'), controller.login)
 */
export const auditLog = (action, module) => async (req, res, next) => {
  // Capture the original json method to intercept the response
  const originalJson = res.json.bind(res);
  res.json = async (body) => {
    res.json = originalJson;
    // Only log after successful response
    if (body?.success) {
      try {
        await AuditLog.create({
          userId: req.user?.id || null,
          organizationId: req.user?.organizationId || null,
          action,
          module,
          description: `${req.method} ${req.originalUrl}`,
          ipAddress: req.ip || req.connection?.remoteAddress,
          userAgent: req.get('User-Agent'),
          metadata: JSON.stringify({
            params: req.params,
            query: req.query,
            // Never log passwords or tokens
            body: sanitizeBody(req.body),
          }),
          statusCode: res.statusCode,
        });
      } catch (err) {
        logger.error('Audit log creation failed:', err.message);
      }
    }
    return originalJson(body);
  };
  next();
};

const sanitizeBody = (body) => {
  const sensitive = ['password', 'token', 'secret', 'pin', 'otp', 'refreshToken'];
  const sanitized = { ...body };
  sensitive.forEach((key) => {
    if (sanitized[key]) sanitized[key] = '***';
  });
  return sanitized;
};
