import { Notification, Member, User } from '../models/index.js';
import emailService from './emailService.js';
import smsService from './smsService.js';
import logger from '../utils/logger.js';
import { Op } from 'sequelize';

class NotificationService {
  /**
   * Create and send notification through specified channels
   * @param {Object} data - Notification data
   * @param {string} data.organizationId - Organization ID
   * @param {string} data.userId - User ID (optional)
   * @param {string} data.memberId - Member ID (optional)
   * @param {string} data.type - Notification type (transaction, loan, member, system)
   * @param {string} data.title - Notification title
   * @param {string} data.message - Notification message
   * @param {Array<string>} data.channels - Delivery channels ['in_app', 'email', 'sms']
   * @param {Object} data.metadata - Additional metadata
   */
  async create(data) {
    const { 
      organizationId, 
      userId, 
      memberId, 
      type, 
      title, 
      message, 
      channels = ['in_app'], 
      metadata = {} 
    } = data;

    const results = { in_app: null, email: null, sms: null };

    // Get recipient details
    let user = null;
    let member = null;

    if (userId) {
      user = await User.findByPk(userId);
    }
    if (memberId) {
      member = await Member.findByPk(memberId);
    }

    // In-app notification (always create if in channels)
    if (channels.includes('in_app')) {
      try {
        const notification = await Notification.create({
          organizationId,
          userId: userId || (member?.userAccount?.id),
          memberId,
          type,
          title,
          message,
          channel: 'in_app',
          metadata,
        });
        results.in_app = { success: true, data: notification };
        logger.info(`In-app notification created: ${notification.id}`);
      } catch (error) {
        results.in_app = { success: false, error: error.message };
        logger.error('In-app notification failed:', error);
      }
    }

    // Email notification
    if (channels.includes('email')) {
      const email = user?.email || member?.email;
      if (email) {
        try {
          await emailService.send({
            to: email,
            subject: title,
            html: this._formatEmailHtml(title, message, metadata),
          });
          
          // Log email notification
          await Notification.create({
            organizationId,
            userId,
            memberId,
            type,
            title,
            message,
            channel: 'email',
            isRead: true, // Email is considered "read" once sent
            readAt: new Date(),
            metadata: { ...metadata, email },
          });
          
          results.email = { success: true, email };
          logger.info(`Email notification sent to: ${email}`);
        } catch (error) {
          results.email = { success: false, error: error.message };
          logger.error('Email notification failed:', error);
        }
      } else {
        results.email = { success: false, error: 'No email address found' };
      }
    }

    // SMS notification
    if (channels.includes('sms')) {
      const phone = member?.phone || user?.phone;
      if (phone) {
        try {
          await smsService.send({
            to: phone,
            message: `${title}: ${message}`,
          });
          
          // Log SMS notification
          await Notification.create({
            organizationId,
            userId,
            memberId,
            type,
            title,
            message,
            channel: 'sms',
            isRead: true, // SMS is considered "read" once sent
            readAt: new Date(),
            metadata: { ...metadata, phone },
          });
          
          results.sms = { success: true, phone };
          logger.info(`SMS notification sent to: ${phone}`);
        } catch (error) {
          results.sms = { success: false, error: error.message };
          logger.error('SMS notification failed:', error);
        }
      } else {
        results.sms = { success: false, error: 'No phone number found' };
      }
    }

    return results;
  }

  /**
   * Send notification to multiple users
   */
  async broadcast(data) {
    const { organizationId, userIds, memberIds, type, title, message, channels, metadata } = data;

    const promises = [];

    if (userIds && userIds.length > 0) {
      userIds.forEach((userId) => {
        promises.push(
          this.create({ organizationId, userId, type, title, message, channels, metadata })
        );
      });
    }

    if (memberIds && memberIds.length > 0) {
      memberIds.forEach((memberId) => {
        promises.push(
          this.create({ organizationId, memberId, type, title, message, channels, metadata })
        );
      });
    }

    const results = await Promise.allSettled(promises);
    return {
      total: results.length,
      successful: results.filter((r) => r.status === 'fulfilled').length,
      failed: results.filter((r) => r.status === 'rejected').length,
      results,
    };
  }

  /**
   * Notification templates
   */
  async sendTransactionNotification(transaction, member) {
    return this.create({
      organizationId: transaction.organizationId,
      memberId: member.id,
      type: 'transaction',
      title: 'Transaction Alert',
      message: `Your ${transaction.type} of KES ${parseFloat(transaction.amount).toLocaleString()} was successful. Reference: ${transaction.reference}`,
      channels: ['in_app', 'email', 'sms'],
      metadata: {
        transactionId: transaction.id,
        reference: transaction.reference,
        amount: transaction.amount,
        type: transaction.type,
      },
    });
  }

  async sendLoanApprovalNotification(loan, member) {
    return this.create({
      organizationId: loan.organizationId,
      memberId: member.id,
      type: 'loan',
      title: 'Loan Approved',
      message: `Congratulations! Your loan application ${loan.loanNumber} for KES ${parseFloat(loan.principalAmount).toLocaleString()} has been approved.`,
      channels: ['in_app', 'email', 'sms'],
      metadata: {
        loanId: loan.id,
        loanNumber: loan.loanNumber,
        amount: loan.principalAmount,
      },
    });
  }

  async sendLoanRejectionNotification(loan, member, reason) {
    return this.create({
      organizationId: loan.organizationId,
      memberId: member.id,
      type: 'loan',
      title: 'Loan Application Update',
      message: `Your loan application ${loan.loanNumber} was not approved. Reason: ${reason}`,
      channels: ['in_app', 'email'],
      metadata: {
        loanId: loan.id,
        loanNumber: loan.loanNumber,
        reason,
      },
    });
  }

  async sendLoanDisbursementNotification(loan, member) {
    return this.create({
      organizationId: loan.organizationId,
      memberId: member.id,
      type: 'loan',
      title: 'Loan Disbursed',
      message: `Your loan ${loan.loanNumber} of KES ${parseFloat(loan.principalAmount).toLocaleString()} has been disbursed via ${loan.disbursementMethod}.`,
      channels: ['in_app', 'email', 'sms'],
      metadata: {
        loanId: loan.id,
        loanNumber: loan.loanNumber,
        amount: loan.principalAmount,
        method: loan.disbursementMethod,
      },
    });
  }

  async sendLoanRepaymentReminderNotification(loan, member, installment) {
    return this.create({
      organizationId: loan.organizationId,
      memberId: member.id,
      type: 'loan',
      title: 'Loan Repayment Reminder',
      message: `Your loan ${loan.loanNumber} repayment of KES ${parseFloat(installment.dueAmount).toLocaleString()} is due on ${installment.dueDate}.`,
      channels: ['in_app', 'sms'],
      metadata: {
        loanId: loan.id,
        loanNumber: loan.loanNumber,
        dueAmount: installment.dueAmount,
        dueDate: installment.dueDate,
      },
    });
  }

  async sendMemberActivationNotification(member) {
    return this.create({
      organizationId: member.organizationId,
      memberId: member.id,
      type: 'member',
      title: 'Account Activated',
      message: `Welcome to Amana SACCO! Your member account ${member.memberNumber} has been activated. You can now access all services.`,
      channels: ['in_app', 'email', 'sms'],
      metadata: {
        memberId: member.id,
        memberNumber: member.memberNumber,
      },
    });
  }

  async sendSystemNotification(organizationId, title, message, userIds = [], memberIds = []) {
    if (userIds.length === 0 && memberIds.length === 0) {
      // Broadcast to all organization users
      const users = await User.findAll({ where: { organizationId, status: 'active' } });
      userIds = users.map((u) => u.id);
    }

    return this.broadcast({
      organizationId,
      userIds,
      memberIds,
      type: 'system',
      title,
      message,
      channels: ['in_app'],
      metadata: {},
    });
  }

  /**
   * Get user notifications with pagination
   */
  async getUserNotifications(userId, organizationId, options = {}) {
    const { page = 1, limit = 20, isRead } = options;
    const where = { userId, organizationId };
    if (isRead !== undefined) where.isRead = isRead;

    const { count, rows } = await Notification.findAndCountAll({
      where,
      limit,
      offset: (page - 1) * limit,
      order: [['createdAt', 'DESC']],
    });

    return {
      notifications: rows,
      total: count,
      page,
      limit,
      unreadCount: await this.getUnreadCount(userId, organizationId),
    };
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId, organizationId) {
    return Notification.count({
      where: { userId, organizationId, isRead: false },
    });
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId, userId, organizationId) {
    const notification = await Notification.findOne({
      where: { id: notificationId, userId, organizationId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    await notification.update({ isRead: true, readAt: new Date() });
    return notification;
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId, organizationId) {
    await Notification.update(
      { isRead: true, readAt: new Date() },
      { where: { userId, organizationId, isRead: false } }
    );
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId, userId, organizationId) {
    const result = await Notification.destroy({
      where: { id: notificationId, userId, organizationId },
    });

    if (result === 0) {
      throw new Error('Notification not found');
    }
  }

  /**
   * Format email HTML
   */
  _formatEmailHtml(title, message, metadata = {}) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 40px 0;">
                <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 32px 32px 24px; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); border-radius: 8px 8px 0 0;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">
                        Amana SACCO
                      </h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 32px;">
                      <h2 style="margin: 0 0 16px; color: #111827; font-size: 20px; font-weight: 600;">
                        ${title}
                      </h2>
                      <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 1.5;">
                        ${message}
                      </p>
                      
                      ${Object.keys(metadata).length > 0 ? `
                        <table style="width: 100%; border-collapse: collapse; margin-top: 24px;">
                          ${Object.entries(metadata).map(([key, value]) => `
                            <tr>
                              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
                                ${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                              </td>
                              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #111827; font-size: 14px; font-weight: 500;">
                                ${value}
                              </td>
                            </tr>
                          `).join('')}
                        </table>
                      ` : ''}
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 24px 32px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                      <p style="margin: 0; color: #6b7280; font-size: 12px;">
                        This is an automated notification from Amana SACCO Management System
                      </p>
                      <p style="margin: 8px 0 0; color: #9ca3af; font-size: 11px;">
                        © ${new Date().getFullYear()} Amana SACCO. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
  }
}

export default new NotificationService();
