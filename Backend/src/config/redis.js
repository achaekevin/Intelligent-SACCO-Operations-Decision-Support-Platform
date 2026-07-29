import { createClient } from 'redis';
import logger from '../utils/logger.js';

let redisClient = null;
let redisWarned = false;

export const connectRedis = async () => {
  try {
    const client = createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        reconnectStrategy: false, // Disable infinite reconnect log spam if Redis is offline
      },
      ...(process.env.REDIS_PASSWORD && { password: process.env.REDIS_PASSWORD }),
      database: parseInt(process.env.REDIS_DB) || 0,
    });

    client.on('error', (err) => {
      if (!redisWarned) {
        logger.warn(`⚠️ Redis notice: ${err.message}. System running with in-memory fallback.`);
        redisWarned = true;
      }
    });

    client.on('connect', () => logger.info('✅ Redis connected successfully'));
    client.on('ready', () => logger.info('✅ Redis client ready'));

    await client.connect();
    redisClient = client;
    return redisClient;
  } catch (err) {
    if (!redisWarned) {
      logger.warn(`⚠️ Redis is not active locally (${err.message}). Caching running in safe fallback mode.`);
      redisWarned = true;
    }
    return null;
  }
};

export const getRedisClient = () => {
  return redisClient;
};

// Safe Convenience helpers (no-op when Redis is offline)
export const redisSet = async (key, value, ttlSeconds = null) => {
  try {
    if (!redisClient || !redisClient.isOpen) return;
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await redisClient.setEx(key, ttlSeconds, serialized);
    } else {
      await redisClient.set(key, serialized);
    }
  } catch (e) {
    // Ignore Redis fallback errors
  }
};

export const redisGet = async (key) => {
  try {
    if (!redisClient || !redisClient.isOpen) return null;
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  } catch (e) {
    return null;
  }
};

export const redisDel = async (key) => {
  try {
    if (!redisClient || !redisClient.isOpen) return;
    await redisClient.del(key);
  } catch (e) {}
};

export const redisExists = async (key) => {
  try {
    if (!redisClient || !redisClient.isOpen) return 0;
    return await redisClient.exists(key);
  } catch (e) {
    return 0;
  }
};

export default { connectRedis, getRedisClient, redisSet, redisGet, redisDel, redisExists };
