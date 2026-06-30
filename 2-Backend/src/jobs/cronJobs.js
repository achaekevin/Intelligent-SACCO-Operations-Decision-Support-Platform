import cron from 'node-cron';
import logger from '../utils/logger.js';
import { addInterestAccrualJob } from '../queues/index.js';

/**
 * Registers all cron jobs.
 * Called once from server.js after app bootstrap.
 */
export const startCronJobs = () => {
  // ─── Monthly interest accrual (1st of every month at 01:00) ──
  cron.schedule('0 1 1 * *', async () => {
    logger.info('[CRON] Starting monthly interest accrual...');
    try {
      const { Organization } = await import('../models/index.js');
      const orgs = await Organization.findAll({ where: { status: 'active' }, attributes: ['id'] });
      for (const org of orgs) {
        await addInterestAccrualJob(org.id);
      }
      logger.info(`[CRON] Queued interest accrual for ${orgs.length} organization(s).`);
    } catch (err) {
      logger.error('[CRON] Interest accrual failed:', err.message);
    }
  });

  // ─── Daily loan penalty calculation (every day at 00:30) ──────
  cron.schedule('30 0 * * *', async () => {
    logger.info('[CRON] Checking for overdue loan repayments...');
    try {
      const { LoanRepayment, Loan } = await import('../models/index.js');
      const { Op } = await import('sequelize');
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const overdue = await LoanRepayment.findAll({
        where: {
          status: 'pending',
          dueDate: { [Op.lte]: yesterday },
        },
      });

      for (const repayment of overdue) {
        await repayment.update({ status: 'overdue' });
      }

      logger.info(`[CRON] Marked ${overdue.length} repayment(s) as overdue.`);
    } catch (err) {
      logger.error('[CRON] Penalty calculation failed:', err.message);
    }
  });

  // ─── Loan reminders (every day at 08:00) ─────────────────────
  cron.schedule('0 8 * * *', async () => {
    logger.info('[CRON] Sending loan repayment reminders...');
    try {
      const { LoanRepayment, Loan, Member } = await import('../models/index.js');
      const { Op } = await import('sequelize');
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const dueTomorrow = await LoanRepayment.findAll({
        where: { status: 'pending', dueDate: tomorrowStr },
        include: [
          { model: Loan, as: 'loan', include: [{ model: Member, as: 'member' }] },
        ],
      });

      const emailService = (await import('../services/emailService.js')).default;
      for (const repayment of dueTomorrow) {
        const member = repayment.loan?.member;
        if (member?.email) {
          await emailService.send({
            to: member.email,
            subject: 'Loan Repayment Reminder',
            html: `<p>Dear ${member.firstName}, your loan repayment of KES ${parseFloat(repayment.dueAmount).toLocaleString()} is due tomorrow (${tomorrowStr}). Please ensure your account is funded.</p>`,
          }).catch(() => {});
        }
      }
      logger.info(`[CRON] Sent ${dueTomorrow.length} reminder(s).`);
    } catch (err) {
      logger.error('[CRON] Loan reminders failed:', err.message);
    }
  });

  // ─── Daily savings report (every day at 23:55) ────────────────
  cron.schedule('55 23 * * *', async () => {
    logger.info('[CRON] Generating daily savings summary...');
    try {
      const { savingsTransactionRepository } = await import('../repositories/savingsRepository.js');
      const { Organization } = await import('../models/index.js');
      const orgs = await Organization.findAll({ where: { status: 'active' }, attributes: ['id', 'name'] });
      const today = new Date().toISOString().split('T')[0];

      for (const org of orgs) {
        const summary = await savingsTransactionRepository.getDailySummary(org.id, today);
        logger.info(`[CRON] Daily summary for ${org.name}: ${JSON.stringify(summary)}`);
      }
    } catch (err) {
      logger.error('[CRON] Daily report failed:', err.message);
    }
  });

  // ─── Expired fixed deposits check (every day at 09:00) ───────
  cron.schedule('0 9 * * *', async () => {
    logger.info('[CRON] Checking for matured fixed deposits...');
    try {
      const { SavingsAccount } = await import('../models/index.js');
      const { Op } = await import('sequelize');
      const today = new Date().toISOString().split('T')[0];

      const matured = await SavingsAccount.findAll({
        where: {
          accountType: 'fixed_deposit',
          status: 'active',
          maturityDate: { [Op.lte]: today },
        },
      });

      const emailService = (await import('../services/emailService.js')).default;
      const { Member } = await import('../models/index.js');

      for (const account of matured) {
        const member = await Member.findByPk(account.memberId);
        if (member?.email) {
          await emailService.send({
            to: member.email,
            subject: 'Fixed Deposit Matured',
            html: `<p>Dear ${member.firstName}, your fixed deposit account ${account.accountNumber} has matured. Please visit your nearest branch or contact us to process your withdrawal or renewal.</p>`,
          }).catch(() => {});
        }
      }
      logger.info(`[CRON] Notified ${matured.length} matured fixed deposit(s).`);
    } catch (err) {
      logger.error('[CRON] Fixed deposit check failed:', err.message);
    }
  });

  logger.info('✅ Cron jobs scheduled');
};
