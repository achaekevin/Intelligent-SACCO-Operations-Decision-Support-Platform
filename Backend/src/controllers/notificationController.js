import { Notification } from '../models/index.js';
import notificationService from '../services/notificationService.js';
import smsService from '../services/smsService.js';
import { successResponse, paginatedResponse, createdResponse } from '../utils/response.js';
import { Op } from 'sequelize';

class NotificationController {
  async list(req, res, next) {
    try {
      const page  = parseInt(req.query.page)  || 1;
      const limit = parseInt(req.query.limit) || 20;
      const where = { organizationId: req.user.organizationId, userId: req.user.id };
      if (req.query.isRead !== undefined) where.isRead = req.query.isRead === 'true';
      if (req.query.type) where.type = req.query.type;
      if (req.query.channel) where.channel = req.query.channel;
      
      const { count, rows } = await Notification.findAndCountAll({
        where, limit, offset: (page - 1) * limit, order: [['createdAt', 'DESC']],
      });
      
      const unreadCount = await notificationService.getUnreadCount(req.user.id, req.user.organizationId);
      
      return paginatedResponse(res, { 
        data: rows, 
        total: count, 
        page, 
        limit,
        meta: { unreadCount } 
      });
    } catch (err) { next(err); }
  }

  async markRead(req, res, next) {
    try {
      const notification = await notificationService.markAsRead(
        req.params.id, 
        req.user.id, 
        req.user.organizationId
      );
      return successResponse(res, { message: 'Notification marked as read.', data: notification });
    } catch (err) { next(err); }
  }

  async markAllRead(req, res, next) {
    try {
      await notificationService.markAllAsRead(req.user.id, req.user.organizationId);
      return successResponse(res, { message: 'All notifications marked as read.' });
    } catch (err) { next(err); }
  }

  async delete(req, res, next) {
    try {
      await notificationService.deleteNotification(
        req.params.id, 
        req.user.id, 
        req.user.organizationId
      );
      return successResponse(res, { message: 'Notification deleted.' });
    } catch (err) { next(err); }
  }

  async unreadCount(req, res, next) {
    try {
      const unreadCount = await notificationService.getUnreadCount(
        req.user.id, 
        req.user.organizationId
      );
      return successResponse(res, { data: { unreadCount } });
    } catch (err) { next(err); }
  }

  // Admin: Create custom notification
  async create(req, res, next) {
    try {
      const { userIds, memberIds, type, title, message, channels } = req.body;
      
      if (userIds && userIds.length > 0) {
        const results = await notificationService.broadcast({
          organizationId: req.user.organizationId,
          userIds,
          type,
          title,
          message,
          channels,
          metadata: { createdBy: req.user.id }
        });
        return createdResponse(res, { message: 'Notifications sent.', data: results });
      }
      
      if (memberIds && memberIds.length > 0) {
        const results = await notificationService.broadcast({
          organizationId: req.user.organizationId,
          memberIds,
          type,
          title,
          message,
          channels,
          metadata: { createdBy: req.user.id }
        });
        return createdResponse(res, { message: 'Notifications sent.', data: results });
      }

      return res.status(400).json({ 
        success: false, 
        message: 'Please provide userIds or memberIds', 
        errors: [] 
      });
    } catch (err) { next(err); }
  }

  // Admin: Send system notification to all users
  async sendSystemNotification(req, res, next) {
    try {
      const { title, message } = req.body;
      
      const results = await notificationService.sendSystemNotification(
        req.user.organizationId,
        title,
        message
      );
      
      return createdResponse(res, { message: 'System notification sent to all users.', data: results });
    } catch (err) { next(err); }
  }

  // Check SMS balance
  async getSmsBalance(req, res, next) {
    try {
      const balance = await smsService.getBalance();
      return successResponse(res, { data: balance });
    } catch (err) { next(err); }
  }

  // Get notification statistics
  async getStats(req, res, next) {
    try {
      const [total, unread, byType, byChannel] = await Promise.all([
        Notification.count({ 
          where: { userId: req.user.id, organizationId: req.user.organizationId } 
        }),
        Notification.count({ 
          where: { userId: req.user.id, organizationId: req.user.organizationId, isRead: false } 
        }),
        Notification.findAll({
          where: { userId: req.user.id, organizationId: req.user.organizationId },
          attributes: [
            'type',
            [Notification.sequelize.fn('COUNT', Notification.sequelize.col('id')), 'count']
          ],
          group: ['type']
        }),
        Notification.findAll({
          where: { userId: req.user.id, organizationId: req.user.organizationId },
          attributes: [
            'channel',
            [Notification.sequelize.fn('COUNT', Notification.sequelize.col('id')), 'count']
          ],
          group: ['channel']
        })
      ]);

      return successResponse(res, { 
        data: {
          total,
          unread,
          read: total - unread,
          byType: byType.reduce((acc, item) => {
            acc[item.type] = parseInt(item.get('count'));
            return acc;
          }, {}),
          byChannel: byChannel.reduce((acc, item) => {
            acc[item.channel] = parseInt(item.get('count'));
            return acc;
          }, {})
        }
      });
    } catch (err) { next(err); }
  }
}

export default new NotificationController();
