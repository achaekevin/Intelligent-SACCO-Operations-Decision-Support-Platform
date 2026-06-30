import { Queue, Worker, QueueEvents } from 'bullmq';
import logger from '../utils/logger.js';

const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  ...(process.env.REDIS_PASSWORD && { password: process.env.REDIS_PASSWORD }),
};

// ─── Queue Definitions ──────────────────────────────────────────
export const emailQueue = new Queue('email', { connection: redisConnection });
export const notificationQueue = new Queue('notification', { connection: redisConnection });
export const reportQueue = new Queue('report', { connection: redisConnection });
export const interestQueue = new Queue('interest_accrual', { connection: redisConnection });

// ─── Job Helpers ────────────────────────────────────────────────
export const addEmailJob = async (data, opts = {}) => {
  return emailQueue.add('send_email', data, { attempts: 3, backoff: { type: 'exponential', delay: 5000 }, ...opts });
};

export const addNotificationJob = async (data, opts = {}) => {
  return notificationQueue.add('send_notification', data, { attempts: 2, ...opts });
};

export const addInterestAccrualJob = async (organizationId) => {
  return interestQueue.add('accrue_interest', { organizationId }, {
    attempts: 3,
    backoff: { type: 'fixed', delay: 60000 },
  });
};

// ─── Workers ────────────────────────────────────────────────────
export const startWorkers = () => {
  // Email worker
  const emailWorker = new Worker('email', async (job) => {
    const emailService = (await import('../services/emailService.js')).default;
    const { to, subject, html, text } = job.data;
    await emailService.send({ to, subject, html, text });
    logger.info(`Email job ${job.id} completed: ${to}`);
  }, { connection: redisConnection, concurrency: 5 });

  // Notification worker
  const notificationWorker = new Worker('notification', async (job) => {
    const { Notification } = await import('../models/index.js');
    await Notification.create(job.data);
    logger.info(`Notification job ${job.id} completed for user ${job.data.userId}`);
  }, { connection: redisConnection, concurrency: 10 });

  // Interest accrual worker
  const interestWorker = new Worker('interest_accrual', async (job) => {
    const savingsService = (await import('../services/savingsService.js')).default;
    const count = await savingsService.accrueInterest(job.data.organizationId);
    logger.info(`Interest accrual job ${job.id}: credited ${count} accounts for org ${job.data.organizationId}`);
  }, { connection: redisConnection, concurrency: 1 });

  // Error handlers
  [emailWorker, notificationWorker, interestWorker].forEach((worker) => {
    worker.on('failed', (job, err) => {
      logger.error(`Queue worker failed — job ${job?.id}: ${err.message}`);
    });
  });

  logger.info('✅ BullMQ workers started');
};
