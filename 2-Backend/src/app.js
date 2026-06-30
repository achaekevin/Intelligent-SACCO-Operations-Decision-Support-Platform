import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import hpp from 'hpp';
import path from 'path';
import { fileURLToPath } from 'url';

import errorHandler from './middlewares/errorHandler.js';
import apiRoutes from './routes/index.js';
import { setupSwagger } from './config/swagger.js';
import logger from './utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const createApp = () => {
  const app = express();

  // ─── Security Headers ────────────────────────────────────────
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  // ─── CORS ─────────────────────────────────────────────────────
  app.use(cors({
    origin: (origin, callback) => {
      const allowed = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || 'http://localhost:5173').split(',');
      if (!origin || allowed.includes(origin) || process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    maxAge: 86400,
  }));

  // ─── Global Rate Limiter ─────────────────────────────────────
  app.use(rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests. Please try again later.' },
    skip: (req) => process.env.NODE_ENV === 'test',
  }));

  // ─── Body Parsers ─────────────────────────────────────────────
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser(process.env.COOKIE_SECRET));

  // ─── HTTP Parameter Pollution Prevention ─────────────────────
  app.use(hpp());

  // ─── Compression ─────────────────────────────────────────────
  app.use(compression());

  // ─── HTTP Request Logging ─────────────────────────────────────
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined', {
      stream: { write: (message) => logger.info(message.trim()) },
      skip: (req) => req.url === '/api/v1/health',
    }));
  }

  // ─── Static file serving (uploads) ────────────────────────────
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  // ─── Swagger Docs ─────────────────────────────────────────────
  if (process.env.NODE_ENV !== 'production') {
    setupSwagger(app);
    logger.info('📚 Swagger docs available at /api-docs');
  }

  // ─── API Routes ───────────────────────────────────────────────
  app.use('/api/v1', apiRoutes);

  // ─── 404 Handler ──────────────────────────────────────────────
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: `Route ${req.method} ${req.originalUrl} not found`,
    });
  });

  // ─── Global Error Handler (must be last) ──────────────────────
  app.use(errorHandler);

  return app;
};

export default createApp;
