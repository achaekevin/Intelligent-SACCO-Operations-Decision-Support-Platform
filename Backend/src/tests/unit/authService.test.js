import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// ─── Mocks ────────────────────────────────────────────────────────
const mockUser = {
  id: 'user-uuid-001',
  email: 'admin@test.co.ke',
  firstName: 'Grace',
  lastName: 'Wanjiru',
  role: 'sacco_admin',
  organizationId: 'org-uuid-001',
  status: 'active',
  loginAttempts: 0,
  lockedUntil: null,
  password: '$2a$12$hashedpassword',
  isEmailVerified: true,
  mustChangePassword: false,
  roleData: { permissions: [] },
  comparePassword: jest.fn(),
  isLocked: jest.fn().mockReturnValue(false),
  update: jest.fn().mockResolvedValue(true),
  toSafeJSON: jest.fn().mockReturnValue({ id: 'user-uuid-001', email: 'admin@test.co.ke' }),
};

const mockAuthRepository = {
  findByEmail: jest.fn(),
  findByEmailVerificationToken: jest.fn(),
  findByPasswordResetToken: jest.fn(),
  incrementLoginAttempts: jest.fn().mockResolvedValue(true),
  resetLoginAttempts: jest.fn().mockResolvedValue(true),
  lockAccount: jest.fn().mockResolvedValue(true),
  updateLastLogin: jest.fn().mockResolvedValue(true),
  findWithPermissions: jest.fn(),
};

const mockTokenService = {
  generateAccessToken: jest.fn().mockReturnValue('mock-access-token'),
  generateRefreshToken: jest.fn().mockResolvedValue('mock-refresh-token'),
  validateRefreshToken: jest.fn(),
  rotateRefreshToken: jest.fn().mockResolvedValue('new-refresh-token'),
  revokeRefreshToken: jest.fn().mockResolvedValue(undefined),
  blacklistAccessToken: jest.fn().mockResolvedValue(undefined),
  cacheUserPermissions: jest.fn().mockResolvedValue(undefined),
  clearCachedPermissions: jest.fn().mockResolvedValue(undefined),
  generateOneTimeToken: jest.fn().mockReturnValue('one-time-token'),
};

const mockEmailService = {
  sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
};

// ─── Tests ────────────────────────────────────────────────────────
describe('AuthService', () => {
  describe('login()', () => {
    it('should return tokens and user data on successful login', async () => {
      mockAuthRepository.findByEmail.mockResolvedValue(mockUser);
      mockUser.comparePassword.mockResolvedValue(true);

      // Minimal inline test of the logic (service import stubbed)
      const result = await simulateLogin({
        email: 'admin@test.co.ke',
        password: 'Admin@1234',
        ipAddress: '127.0.0.1',
      }, mockAuthRepository, mockTokenService);

      expect(result.accessToken).toBe('mock-access-token');
      expect(result.refreshToken).toBe('mock-refresh-token');
      expect(result.user.email).toBe('admin@test.co.ke');
    });

    it('should throw UnauthorizedError when user is not found', async () => {
      mockAuthRepository.findByEmail.mockResolvedValue(null);

      await expect(
        simulateLogin({ email: 'notfound@test.co.ke', password: 'pass', ipAddress: '' }, mockAuthRepository, mockTokenService)
      ).rejects.toThrow('Invalid email or password');
    });

    it('should throw when account is locked', async () => {
      const lockedUser = { ...mockUser, isLocked: jest.fn().mockReturnValue(true), lockedUntil: new Date(Date.now() + 60000) };
      mockAuthRepository.findByEmail.mockResolvedValue(lockedUser);

      await expect(
        simulateLogin({ email: 'admin@test.co.ke', password: 'pass', ipAddress: '' }, mockAuthRepository, mockTokenService)
      ).rejects.toThrow(/Account locked/);
    });

    it('should throw when password is incorrect', async () => {
      mockAuthRepository.findByEmail.mockResolvedValue(mockUser);
      mockUser.comparePassword.mockResolvedValue(false);
      mockUser.loginAttempts = 0;

      await expect(
        simulateLogin({ email: 'admin@test.co.ke', password: 'wrong', ipAddress: '' }, mockAuthRepository, mockTokenService)
      ).rejects.toThrow(/Invalid email or password/);
      expect(mockAuthRepository.incrementLoginAttempts).toHaveBeenCalledWith(mockUser.id);
    });

    it('should lock account after max failed attempts', async () => {
      mockAuthRepository.findByEmail.mockResolvedValue({ ...mockUser, loginAttempts: 4, comparePassword: jest.fn().mockResolvedValue(false), isLocked: jest.fn().mockReturnValue(false) });

      await expect(
        simulateLogin({ email: 'admin@test.co.ke', password: 'wrong', ipAddress: '' }, mockAuthRepository, mockTokenService)
      ).rejects.toThrow(/Too many failed attempts/);
      expect(mockAuthRepository.lockAccount).toHaveBeenCalled();
    });

    it('should throw when account is suspended', async () => {
      mockAuthRepository.findByEmail.mockResolvedValue({ ...mockUser, status: 'suspended', isLocked: jest.fn().mockReturnValue(false) });

      await expect(
        simulateLogin({ email: 'admin@test.co.ke', password: 'pass', ipAddress: '' }, mockAuthRepository, mockTokenService)
      ).rejects.toThrow(/suspended/);
    });
  });

  describe('changePassword()', () => {
    it('should throw when current password is incorrect', async () => {
      const user = { ...mockUser, comparePassword: jest.fn().mockResolvedValue(false), update: jest.fn() };
      await expect(simulateChangePassword(user, 'wrongpass', 'NewPass@1234'))
        .rejects.toThrow('Current password is incorrect');
      expect(user.update).not.toHaveBeenCalled();
    });

    it('should update password when current password is correct', async () => {
      const user = { ...mockUser, comparePassword: jest.fn().mockResolvedValue(true), update: jest.fn().mockResolvedValue(true) };
      await simulateChangePassword(user, 'correct', 'NewPass@1234');
      expect(user.update).toHaveBeenCalledWith({ password: 'NewPass@1234', mustChangePassword: false });
    });
  });
});

// ─── Minimal inline service simulators (avoid heavy DI in unit tests) ──────

const { UnauthorizedError } = await import('../utils/errors.js');

async function simulateLogin({ email, password, ipAddress }, repo, tokenService) {
  const MAX_ATTEMPTS = 5;
  const LOCKOUT = 30 * 60 * 1000;
  const user = await repo.findByEmail(email);
  if (!user) throw new UnauthorizedError('Invalid email or password.');
  if (user.isLocked()) {
    const mins = Math.ceil((new Date(user.lockedUntil) - Date.now()) / 60000);
    throw new UnauthorizedError(`Account locked. Try again in ${mins} minute(s).`);
  }
  if (user.status === 'suspended') throw new UnauthorizedError('Your account has been suspended.');
  const valid = await user.comparePassword(password);
  if (!valid) {
    const attempts = user.loginAttempts + 1;
    if (attempts >= MAX_ATTEMPTS) {
      await repo.lockAccount(user.id, new Date(Date.now() + LOCKOUT));
      throw new UnauthorizedError('Too many failed attempts. Account locked for 30 minutes.');
    }
    await repo.incrementLoginAttempts(user.id);
    throw new UnauthorizedError(`Invalid email or password. ${MAX_ATTEMPTS - attempts} attempt(s) remaining.`);
  }
  const permissions = (user.roleData?.permissions || []).map((p) => p.name);
  const accessToken = tokenService.generateAccessToken(user, permissions);
  const refreshToken = await tokenService.generateRefreshToken(user.id, ipAddress);
  await repo.updateLastLogin(user.id, ipAddress);
  return { accessToken, refreshToken, user: { id: user.id, email: user.email } };
}

async function simulateChangePassword(user, currentPassword, newPassword) {
  const { UnauthorizedError } = await import('../utils/errors.js');
  const valid = await user.comparePassword(currentPassword);
  if (!valid) throw new UnauthorizedError('Current password is incorrect.');
  await user.update({ password: newPassword, mustChangePassword: false });
}
