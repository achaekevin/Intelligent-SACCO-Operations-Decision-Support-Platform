import { Notification } from '../models/index.js';
import { successResponse, paginatedResponse } from '../utils/response.js';
import { Op } from 'sequelize';

class NotificationController {
  async list(req, res, next) {
    try {
      const page  = parseInt(req.query.page)  || 1;
      const limit = parseInt(req.query.limit) || 20;
      const where = { organizationId: req.user.organizationId, userId: req.user.id };
      if (req.query.isRead !== undefined) where.isRead = req.query.isRead === 'true';
      const { count, rows } = await Notification.findAndCountAll({
        where, limit, offset: (page - 1) * limit, order: [['createdAt', 'DESC']],
      });
      return paginatedResponse(res, { data: rows, total: count, page, limit });
    } catch (err) { next(err); }
  }

  async markRead(req, res, next) {
    try {
      const notif = await Notification.findOne({
        where: { id: req.params.id, userId: req.user.id, organizationId: req.user.organizationId },
      });
      if (!notif) return res.status(404).json({ success: false, message: 'Notification not found.', errors: [] });
      await notif.update({ isRead: true, readAt: new Date() });
      return successResponse(res, { message: 'Notification marked as read.', data: notif });
    } catch (err) { next(err); }
  }

  async markAllRead(req, res, next) {
    try {
      await Notification.update(
        { isRead: true, readAt: new Date() },
        { where: { userId: req.user.id, organizationId: req.user.organizationId, isRead: false } }
      );
      return successResponse(res, { message: 'All notifications marked as read.' });
    } catch (err) { next(err); }
  }

  async delete(req, res, next) {
    try {
      await Notification.destroy({
        where: { id: req.params.id, userId: req.user.id, organizationId: req.user.organizationId },
      });
      return successResponse(res, { message: 'Notification deleted.' });
    } catch (err) { next(err); }
  }

  async unreadCount(req, res, next) {
    try {
      const count = await Notification.count({
        where: { userId: req.user.id, organizationId: req.user.organizationId, isRead: false },
      });
      return successResponse(res, { data: { unreadCount: count } });
    } catch (err) { next(err); }
  }
}

export default new NotificationController();
