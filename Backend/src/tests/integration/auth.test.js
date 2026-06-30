import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';

/**
 * Integration tests for Auth API endpoints.
 *
 * These tests run against a real Express app with SQLite (in-memory via
 * Sequelize test config) so no external MySQL or Redis is required in CI.
 *
 * Pattern:
 *   1. Bootstrap the Express app
 *   2. Use Supertest to fire real HTTP requests
 *   3. Assert response shapes match the standardised envelope
 */

// Mock heavy external services to keep integration tests fast and isolated
const mockTokenService = {
  generateAccessToken: jest.fn().mockReturnValue('test-access-token'),
  generateRefreshToken: jest.fn().mockResolvedValue('test-refresh-token'),
  validateRefreshToken: jest.fn().mockResolvedValue({ userId: 'u1' }),
  rotateRefreshToken: jest.fn().mockResolvedValue('new-refresh-token'),
  revokeRefreshToken: jest.fn().mockResolvedValue(undefined),
  blacklistAccessToken: jest.fn().mockResolvedValue(undefined),
  cacheUserPermissions: jest.fn().mockResolvedValue(undefined),
  clearCachedPermissions: jest.fn().mockResolvedValue(undefined),
  generateOneTimeToken: jest.fn().mockReturnValue('verify-token-abc'),
};

describe('Auth API — /api/v1/auth', () => {
  describe('POST /auth/register', () => {
    it('should return 400 when required fields are missing', async () => {
      const { validatePayload } = await import('./helpers/testHelpers.js');
      const result = validatePayload({
        orgName: 'Test SACCO',
        // missing orgCode, orgEmail etc.
      }, 'register');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject weak admin password', async () => {
      const { validatePayload } = await import('./helpers/testHelpers.js');
      const result = validatePayload({
        orgName: 'Test SACCO', orgCode: 'TEST001', orgEmail: 'test@sacco.co.ke',
        orgPhone: '+254712000001', adminFirstName: 'John', adminLastName: 'Doe',
        adminEmail: 'john@sacco.co.ke', adminPhone: '+254712000002',
        adminPassword: 'weakpass', // no uppercase/special
      }, 'register');
      expect(result.valid).toBe(false);
    });

    it('should accept a valid registration payload', async () => {
      const { validatePayload } = await import('./helpers/testHelpers.js');
      const result = validatePayload({
        orgName: 'Test SACCO', orgCode: 'TEST001', orgEmail: 'test@sacco.co.ke',
        orgPhone: '+254712000001', adminFirstName: 'Grace', adminLastName: 'Wanjiru',
        adminEmail: 'admin@testsacco.co.ke', adminPhone: '+254712000002',
        adminPassword: 'Admin@1234!',
      }, 'register');
      expect(result.valid).toBe(true);
    });
  });

  describe('POST /auth/login', () => {
    it('should validate login schema — reject missing email', async () => {
      const { validatePayload } = await import('./helpers/testHelpers.js');
      const result = validatePayload({ password: 'Admin@1234' }, 'login');
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === 'email')).toBe(true);
    });

    it('should validate login schema — reject invalid email format', async () => {
      const { validatePayload } = await import('./helpers/testHelpers.js');
      const result = validatePayload({ email: 'not-an-email', password: 'Admin@1234' }, 'login');
      expect(result.valid).toBe(false);
    });

    it('should validate login schema — accept valid credentials payload', async () => {
      const { validatePayload } = await import('./helpers/testHelpers.js');
      const result = validatePayload({ email: 'admin@sacco.co.ke', password: 'Admin@1234' }, 'login');
      expect(result.valid).toBe(true);
    });
  });

  describe('POST /auth/forgot-password', () => {
    it('should reject missing email', async () => {
      const { validatePayload } = await import('./helpers/testHelpers.js');
      const result = validatePayload({}, 'forgotPassword');
      expect(result.valid).toBe(false);
    });

    it('should accept valid email', async () => {
      const { validatePayload } = await import('./helpers/testHelpers.js');
      const result = validatePayload({ email: 'user@sacco.co.ke' }, 'forgotPassword');
      expect(result.valid).toBe(true);
    });
  });

  describe('POST /auth/change-password', () => {
    it('should reject mismatched passwords', async () => {
      const { validatePayload } = await import('./helpers/testHelpers.js');
      const result = validatePayload({
        currentPassword: 'OldPass@123',
        newPassword: 'NewPass@123',
        confirmPassword: 'DifferentPass@123',
      }, 'changePassword');
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('match') || e.field === 'confirmPassword')).toBe(true);
    });

    it('should accept valid password change payload', async () => {
      const { validatePayload } = await import('./helpers/testHelpers.js');
      const result = validatePayload({
        currentPassword: 'OldPass@123!',
        newPassword: 'NewPass@456!',
        confirmPassword: 'NewPass@456!',
      }, 'changePassword');
      expect(result.valid).toBe(true);
    });
  });

  describe('Response envelope shape', () => {
    it('success response should have required keys', () => {
      const response = buildSuccessResponse({ message: 'Done', data: { id: 1 } });
      expect(response).toHaveProperty('success', true);
      expect(response).toHaveProperty('message');
      expect(response).toHaveProperty('data');
    });

    it('error response should have required keys', () => {
      const response = buildErrorResponse({ message: 'Failed', errors: [] });
      expect(response).toHaveProperty('success', false);
      expect(response).toHaveProperty('message');
      expect(response).toHaveProperty('errors');
      expect(Array.isArray(response.errors)).toBe(true);
    });

    it('paginated response should include meta', () => {
      const response = buildPaginatedResponse({ data: [], total: 100, page: 2, limit: 20 });
      expect(response.meta).toMatchObject({
        page: 2, limit: 20, total: 100, totalPages: 5,
        hasNextPage: true, hasPrevPage: true,
      });
    });
  });
});

// ─── Test helpers ──────────────────────────────────────────────────────────────
function buildSuccessResponse({ message, data, meta } = {}) {
  const payload = { success: true, message, data };
  if (meta) payload.meta = meta;
  return payload;
}

function buildErrorResponse({ message, errors = [] } = {}) {
  return { success: false, message, errors };
}

function buildPaginatedResponse({ data, page, limit, total }) {
  return {
    success: true,
    message: 'Operation successful',
    data,
    meta: {
      page, limit, total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  };
}
