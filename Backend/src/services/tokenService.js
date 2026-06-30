import jwt from 'jsonwebtoken';
import { redisSet, redisGet, redisDel } from '../config/redis.js';
import { generateSecureToken } from '../utils/helpers.js';
import { CACHE_TTL } from '../constants/index.js';

class TokenService {
  /**
   * Generate JWT access token carrying user claims
   */
  generateAccessToken(user, permissions = []) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        branchId: user.branchId,
        permissions,
      },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '30m' }
    );
  }

  /**
   * Generate opaque refresh token and store in Redis with user metadata
   */
  async generateRefreshToken(userId, ipAddress = '') {
    const token = generateSecureToken(40);
    const key = `refresh:${userId}:${token}`;
    const ttl = 7 * 24 * 60 * 60; // 7 days
    await redisSet(key, { userId, ipAddress, createdAt: new Date().toISOString() }, ttl);
    return token;
  }

  /**
   * Validate refresh token; returns stored metadata or null
   */
  async validateRefreshToken(userId, token) {
    const key = `refresh:${userId}:${token}`;
    return redisGet(key);
  }

  /**
   * Rotate refresh token — invalidate old, issue new
   */
  async rotateRefreshToken(userId, oldToken, ipAddress = '') {
    await this.revokeRefreshToken(userId, oldToken);
    return this.generateRefreshToken(userId, ipAddress);
  }

  /**
   * Revoke a specific refresh token
   */
  async revokeRefreshToken(userId, token) {
    const key = `refresh:${userId}:${token}`;
    await redisDel(key);
  }

  /**
   * Blacklist an access token until its expiry
   */
  async blacklistAccessToken(token) {
    try {
      const decoded = jwt.decode(token);
      if (!decoded?.exp) return;
      const ttl = decoded.exp - Math.floor(Date.now() / 1000);
      if (ttl > 0) {
        await redisSet(`blacklist:${token}`, true, ttl);
      }
    } catch {
      // token may already be invalid
    }
  }

  /**
   * Generate short-lived token for email verification / password reset
   */
  generateOneTimeToken() {
    return generateSecureToken(32);
  }

  /**
   * Cache user permissions to avoid repeated DB lookups
   */
  async cacheUserPermissions(userId, permissions) {
    await redisSet(`perms:${userId}`, permissions, CACHE_TTL.MEDIUM);
  }

  async getCachedPermissions(userId) {
    return redisGet(`perms:${userId}`);
  }

  async clearCachedPermissions(userId) {
    await redisDel(`perms:${userId}`);
  }
}

export default new TokenService();
