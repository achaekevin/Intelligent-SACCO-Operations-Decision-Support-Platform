import 'dotenv/config';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import createApp from './app.js';
import { connectDatabase } from './config/database.js';
import { connectRedis } from './config/redis.js';
import initializeSocket from './socket/index.js';
import { startWorkers } from './queues/index.js';
import { initJobs } from './jobs/scheduledJobs.js';
import logger from './utils/logger.js';
import { mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT) || 5000;

// Ensure required directories exist
['logs', 'src/uploads/documents', 'src/uploads/photos'].forEach((dir) => {
  mkdirSync(path.join(process.cwd(), dir), { recursive: true });
});

const bootstrap = async () => {
  try {
    logger.info(`🚀  Starting ${process.env.APP_NAME || 'SACCO System'} in ${process.env.NODE_ENV} mode...`);

    // 1. Database
    await connectDatabase();

    // 2. Redis
    await connectRedis();

    // 3. Express app
    const app = createApp();

    // 4. HTTP server
    const httpServer = http.createServer(app);

    // 5. Socket.IO
    const io = new SocketServer(httpServer, {
      cors: {
        origin: (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || 'http://localhost:5173').split(','),
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });
    initializeSocket(io);

    // 6. BullMQ workers
    if (process.env.NODE_ENV !== 'test') {
      startWorkers();
    }

    // 7. Scheduled jobs
    if (process.env.NODE_ENV === 'production') {
      initJobs();
    }

    // 8. Listen
    httpServer.listen(PORT, () => {
      logger.info(`✅  Server listening on port ${PORT}`);
      logger.info(`📚  API docs: http://localhost:${PORT}/api-docs`);
      logger.info(`🔌  Socket.IO ready`);
    });

    // ─── Graceful Shutdown ──────────────────────────────────────
    const shutdown = async (signal) => {
      logger.info(`\n${signal} received. Shutting down gracefully...`);
      httpServer.close(async () => {
        try {
          const { sequelize } = await import('./models/index.js');
          await sequelize.close();
          logger.info('✅  Database connection closed');
          const { getRedisClient } = await import('./config/redis.js');
          await getRedisClient().quit();
          logger.info('✅  Redis connection closed');
        } catch (err) {
          logger.error('Error during shutdown:', err);
        }
        logger.info('✅  Server shut down. Goodbye.');
        process.exit(0);
      });

      // Force kill after 10s
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT',  () => shutdown('SIGINT'));

    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled Promise Rejection:', reason);
    });

    process.on('uncaughtException', (err) => {
      logger.error('Uncaught Exception:', err);
      process.exit(1);
    });

    return { app, httpServer, io };
  } catch (err) {
    logger.error('❌  Fatal startup error:', err);
    process.exit(1);
  }
};

bootstrap();
