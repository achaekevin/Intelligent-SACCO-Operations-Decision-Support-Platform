import { createClient } from 'redis';
import logger from '../utils/logger.js';

let redisClient;

export const connectRedis = async () => {
  redisClient = createClient({
    socket: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6379,
    },
    ...(process.env.REDIS_PASSWORD && { password: process.env.REDIS_PASSWORD }),
    database: parseInt(process.env.REDIS_DB) || 0,
  });

  redisClient.on('error', (err) => logger.error('Redis client error:', err));
  redisClient.on('connect', () => logger.info('✅ Redis connected successfully'));
  redisClient.on('ready', () => logger.info('✅ Redis client ready'));
  redisClient.on('reconnecting', () => logger.warn('⚠️  Redis reconnecting...'));

  await redisClient.connect();
  return redisClient;
};

export const getRedisClient = () => {
  if (!redisClient) throw new Error('Redis client not initialized. Call connectRedis() first.');
  return redisClient;
};

// Convenience helpers
export const redisSet = async (key, value, ttlSeconds = null) => {
  const client = getRedisClient();
  const serialized = JSON.stringify(value);
  if (ttlSeconds) {
    await client.setEx(key, ttlSeconds, serialized);
  } else {
    await client.set(key, serialized);
  }
};

export const redisGet = async (key) => {
  const client = getRedisClient();
  const value = await client.get(key);
  return value ? JSON.parse(value) : null;
};

export const redisDel = async (key) => {
  const client = getRedisClient();
  await client.del(key);
};

export const redisExists = async (key) => {
  const client = getRedisClient();
  return await client.exists(key);
};

export default { connectRedis, getRedisClient, redisSet, redisGet, redisDel, redisExists };
