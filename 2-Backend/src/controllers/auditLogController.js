import { AuditLog } from '../models/index.js';
import { paginatedResponse } from '../utils/response.js';
import { Op } from 'sequelize';

class AuditLogController {
  async list(req, res, next) {
    try {
      const page  = parseInt(req.query.page)  || 1;
      const limit = parseInt(req.query.limit) || 20;
      const where = { organizationId: req.user.organizationId };
      if (req.query.userId)  where.userId = req.query.userId;
      if (req.query.action)  where.action = req.query.action;
      if (req.query.module)  where.module = req.query.module;
      if (req.query.startDate || req.query.endDate) {
        where.createdAt = {};
        if (req.query.startDate) where.createdAt[Op.gte] = new Date(req.query.startDate);
        if (req.query.endDate)   where.createdAt[Op.lte] = new Date(req.query.endDate);
      }
      const { count, rows } = await AuditLog.findAndCountAll({
        where, limit, offset: (page - 1) * limit, order: [['createdAt', 'DESC']],
      });
      return paginatedResponse(res, { data: rows, total: count, page, limit });
    } catch (err) { next(err); }
  }

  async getById(req, res, next) {
    try {
      const { successResponse, notFoundResponse } = await import('../utils/response.js');
      const log = await AuditLog.findOne({ where: { id: req.params.id, organizationId: req.user.organizationId } });
      if (!log) return notFoundResponse(res, 'Audit log entry not found.');
      return successResponse(res, { data: log });
    } catch (err) { next(err); }
  }

  async getByUser(req, res, next) {
    try {
      const page  = parseInt(req.query.page)  || 1;
      const limit = parseInt(req.query.limit) || 20;
      const { count, rows } = await AuditLog.findAndCountAll({
        where: { userId: req.params.userId, organizationId: req.user.organizationId },
        limit, offset: (page - 1) * limit, order: [['createdAt', 'DESC']],
      });
      return paginatedResponse(res, { data: rows, total: count, page, limit });
    } catch (err) { next(err); }
  }
}

export default new AuditLogController();
