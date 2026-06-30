// src/tests/setup.js
import { jest } from '@jest/globals';

// Silence console.log in tests (keep console.error)
global.console.log = jest.fn();
global.console.info = jest.fn();

// Mock Redis so tests don't need a live Redis
jest.unstable_mockModule('../config/redis.js', () => ({
  connectRedis: jest.fn().mockResolvedValue(undefined),
  getRedisClient: jest.fn().mockReturnValue({
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    setEx: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    exists: jest.fn().mockResolvedValue(0),
    quit: jest.fn().mockResolvedValue('OK'),
  }),
  redisGet: jest.fn().mockResolvedValue(null),
  redisSet: jest.fn().mockResolvedValue(undefined),
  redisDel: jest.fn().mockResolvedValue(undefined),
  redisExists: jest.fn().mockResolvedValue(false),
  default: {},
}));

// Mock Nodemailer
jest.unstable_mockModule('nodemailer', () => ({
  default: {
    createTransport: jest.fn().mockReturnValue({
      sendMail: jest.fn().mockResolvedValue({ messageId: 'mock-message-id' }),
    }),
  },
}));
