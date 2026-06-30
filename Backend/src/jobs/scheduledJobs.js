import cron from 'node-cron';
import logger from '../utils/logger.js';
import { addInterestAccrualJob } from '../queues/index.js';

/**
 * Initialises all scheduled background jobs.
 * Call this from server.js after database connection is established.
 */
export const initJobs = () => {
  logger.info('⏰  Initialising scheduled jobs...');

  // ─── Monthly Interest Accrual ─────────────────────────────────
  // Runs at 00:05 on the 1st of every month
  cron.schedule('5 0 1 * *', async () => {
    logger.info('[JOB] Monthly interest accrual started');
    try {
      const { Organization } = await import('../models/index.js');
      const orgs = await Organization.findAll({ where: { status: 'active' } });
      for (const org of orgs) {
        await addInterestAccrualJob(org.id);
      }
      logger.info(`[JOB] Interest accrual queued for ${orgs.length} organization(s)`);
    } catch (err) {
      logger.error('[JOB] Interest accrual error:', err.message);
    }
  }, { timezone: process.env.TZ || 'Africa/Nairobi' });

  // ─── Daily Loan Penalty Check ────────────────────────────────
  // Runs daily at 01:00
  cron.schedule('0 1 * * *', async () => {
    logger.info('[JOB] Daily loan penalty check started');
    try {
      const { Loan, LoanRepayment } = await import('../models/index.js');
      const { Op } = await import('sequelize');
      const today = new Date();

      // Find overdue repayments and mark them
      const overdue = await LoanRepayment.findAll({
        where: {
          dueDate: { [Op.lt]: today },
          status: { [Op.in]: ['pending', 'partial'] },
        },
        include: [{ model: Loan, as: 'loan' }],
      });

      let penaltyCount = 0;
      for (const repayment of overdue) {
        await repayment.update({ status: 'overdue' });
        penaltyCount++;
      }
      logger.info(`[JOB] Marked ${penaltyCount} repayments as overdue`);
    } catch (err) {
      logger.error('[JOB] Loan penalty check error:', err.message);
    }
  }, { timezone: process.env.TZ || 'Africa/Nairobi' });

  // ─── Loan Reminder Notifications ────────────────────────────
  // Runs daily at 08:00 — sends reminders for repayments due in 3 days
  cron.schedule('0 8 * * *', async () => {
    logger.info('[JOB] Loan reminder notifications started');
    try {
      const { Op } = await import('sequelize');
      const { LoanRepayment, Loan, Member } = await import('../models/index.js');
      const { addNotificationJob } = await import('../queues/index.js');

      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      threeDaysFromNow.setHours(23, 59, 59, 999);

      const dueSoon = await LoanRepayment.findAll({
        where: {
          dueDate: { [Op.between]: [todayStart, threeDaysFromNow] },
          status: { [Op.in]: ['pending', 'partial'] },
        },
        include: [
          { model: Loan, as: 'loan', attributes: ['id', 'loanNumber', 'organizationId'] },
        ],
      });

      for (const repayment of dueSoon) {
        await addNotificationJob({
          organizationId: repayment.loan.organizationId,
          memberId: repayment.memberId,
          type: 'loan_reminder',
          title: 'Loan Repayment Due Soon',
          message: `Your loan repayment of KES ${parseFloat(repayment.dueAmount).toLocaleString()} is due on ${repayment.dueDate}.`,
          channel: 'in_app',
        });
      }
      logger.info(`[JOB] Sent ${dueSoon.length} loan reminder notification(s)`);
    } catch (err) {
      logger.error('[JOB] Loan reminder error:', err.message);
    }
  }, { timezone: process.env.TZ || 'Africa/Nairobi' });

  // ─── Daily Report Cache Warm-up ──────────────────────────────
  // Runs at 06:00 — pre-computes dashboard statistics into Redis
  cron.schedule('0 6 * * *', async () => {
    logger.info('[JOB] Daily dashboard cache warm-up started');
    try {
      const { Organization } = await import('../models/index.js');
      const { redisSet } = await import('../config/redis.js');
      const { CACHE_TTL } = await import('../constants/index.js');
      const organizationService = (await import('../services/organizationService.js')).default;

      const orgs = await Organization.findAll({ where: { status: 'active' }, attributes: ['id'] });
      for (const org of orgs) {
        const stats = await organizationService.getStats(org.id);
        await redisSet(`dashboard:${org.id}`, stats, CACHE_TTL.DAY);
      }
      logger.info(`[JOB] Dashboard cache warmed for ${orgs.length} organization(s)`);
    } catch (err) {
      logger.error('[JOB] Dashboard cache error:', err.message);
    }
  }, { timezone: process.env.TZ || 'Africa/Nairobi' });

  // ─── Monthly Statement Generation ────────────────────────────
  // Runs at 00:30 on the 1st of every month
  cron.schedule('30 0 1 * *', async () => {
    logger.info('[JOB] Monthly statement generation started');
    try {
      const { Member } = await import('../models/index.js');
      const { addNotificationJob } = await import('../queues/index.js');
      const activeMembers = await Member.findAll({
        where: { status: 'active' },
        attributes: ['id', 'organizationId', 'firstName', 'email'],
      });
      for (const member of activeMembers) {
        await addNotificationJob({
          organizationId: member.organizationId,
          memberId: member.id,
          type: 'statement',
          title: 'Monthly Account Statement',
          message: `Your ${new Date().toLocaleString('en-KE', { month: 'long' })} statement is ready. Log in to view it.`,
          channel: 'in_app',
        });
      }
      logger.info(`[JOB] Statement notifications queued for ${activeMembers.length} member(s)`);
    } catch (err) {
      logger.error('[JOB] Monthly statement error:', err.message);
    }
  }, { timezone: process.env.TZ || 'Africa/Nairobi' });

  logger.info('✅ All scheduled jobs initialised');
};
