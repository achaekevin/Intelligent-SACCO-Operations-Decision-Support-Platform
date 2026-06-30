import logger from '../utils/logger.js';

const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  ...(process.env.REDIS_PASSWORD && { password: process.env.REDIS_PASSWORD }),
};

// Lazy-loaded queues (only created when BullMQ is available)
let emailQueue, notificationQueue, reportQueue, interestQueue;

const initQueues = async () => {
  try {
    const { Queue } = await import('bullmq');
    emailQueue = new Queue('email', { connection: redisConnection });
    notificationQueue = new Queue('notification', { connection: redisConnection });
    reportQueue = new Queue('report', { connection: redisConnection });
    interestQueue = new Queue('interest_accrual', { connection: redisConnection });
    return true;
  } catch (error) {
    logger.warn('⚠️  BullMQ queues disabled (Redis < 5.0.0 required)');
    return false;
  }
};

// ─── Job Helpers ────────────────────────────────────────────────
export const addEmailJob = async (data, opts = {}) => {
  if (!emailQueue) await initQueues();
  if (!emailQueue) {
    logger.warn('Email job skipped - BullMQ unavailable');
    return null;
  }
  return emailQueue.add('send_email', data, { attempts: 3, backoff: { type: 'exponential', delay: 5000 }, ...opts });
};

export const addNotificationJob = async (data, opts = {}) => {
  if (!notificationQueue) await initQueues();
  if (!notificationQueue) {
    logger.warn('Notification job skipped - BullMQ unavailable');
    return null;
  }
  return notificationQueue.add('send_notification', data, { attempts: 2, ...opts });
};

export const addInterestAccrualJob = async (organizationId) => {
  if (!interestQueue) await initQueues();
  if (!interestQueue) {
    logger.warn('Interest accrual job skipped - BullMQ unavailable');
    return null;
  }
  return interestQueue.add('accrue_interest', { organizationId }, {
    attempts: 3,
    backoff: { type: 'fixed', delay: 60000 },
  });
};

// ─── Workers ────────────────────────────────────────────────────
export const startWorkers = async () => {
  try {
    const { Worker } = await import('bullmq');
    
    // Initialize queues first
    const initialized = await initQueues();
    if (!initialized) {
      logger.warn('⚠️  BullMQ workers disabled - background jobs will not run');
      return;
    }

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
  } catch (error) {
    logger.warn('⚠️  BullMQ workers disabled - background jobs will not run');
  }
};
