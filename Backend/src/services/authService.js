import { sequelize, User, Organization, Role, Permission } from '../models/index.js';
import authRepository from '../repositories/authRepository.js';
import tokenService from './tokenService.js';
import emailService from './emailService.js';
import { AppError, UnauthorizedError, ConflictError, NotFoundError } from '../utils/errors.js';
import { generateSecureToken } from '../utils/helpers.js';
import logger from '../utils/logger.js';

const LOCKOUT_DURATION_MS =
  (parseInt(process.env.LOCKOUT_DURATION_MINUTES) || 30) * 60 * 1000;
const MAX_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5;

class AuthService {
  /**
   * Register a new SACCO organization with a Super/SACCO Admin account
   */
  async registerOrganization({ orgName, orgCode, orgEmail, orgPhone, adminEmail, adminPassword, adminFirstName, adminLastName, adminPhone }) {
    const t = await sequelize.transaction();
    try {
      // 1. Check uniqueness
      const existingOrg = await Organization.findOne({ where: { [sequelize.Sequelize?.Op ? 'email' : 'email']: orgEmail }, transaction: t });
      if (existingOrg) throw new ConflictError('An organization with this email already exists.');

      const existingUser = await User.findOne({ where: { email: adminEmail }, transaction: t });
      if (existingUser) throw new ConflictError('A user with this email already exists.');

      // 2. Create organization
      const organization = await Organization.create({
        name: orgName, code: orgCode.toUpperCase(), email: orgEmail, phone: orgPhone,
      }, { transaction: t });

      // 3. Get or create sacco_admin role
      let [adminRole] = await Role.findOrCreate({
        where: { slug: 'sacco_admin', organizationId: organization.id },
        defaults: { name: 'SACCO Admin', slug: 'sacco_admin', isSystem: true, organizationId: organization.id },
        transaction: t,
      });

      // 4. Create admin user
      const verificationToken = generateSecureToken();
      const verificationExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000);

      const user = await User.create({
        organizationId: organization.id,
        roleId: adminRole.id,
        firstName: adminFirstName,
        lastName: adminLastName,
        email: adminEmail.toLowerCase(),
        phone: adminPhone,
        password: adminPassword,
        role: 'sacco_admin',
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpiry,
      }, { transaction: t });

      await t.commit();

      // 5. Send verification email (non-blocking)
      emailService.sendVerificationEmail(user, verificationToken).catch((e) =>
        logger.error('Verification email failed:', e.message)
      );

      logger.info(`New SACCO registered: ${organization.code} — Admin: ${user.email}`);
      return { organization, user: user.toSafeJSON() };
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  /**
   * Authenticate a user and issue access + refresh tokens
   */
  async login({ email, password, ipAddress }) {
    const user = await authRepository.findByEmail(email.toLowerCase());
    if (!user) throw new UnauthorizedError('Invalid email or password.');

    // Account lockout check
    if (user.isLocked()) {
      const minutesLeft = Math.ceil((new Date(user.lockedUntil) - Date.now()) / 60000);
      throw new UnauthorizedError(`Account locked. Try again in ${minutesLeft} minute(s).`);
    }

    if (user.status === 'suspended') {
      throw new UnauthorizedError('Your account has been suspended. Contact support.');
    }

    // Password check
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      const attempts = user.loginAttempts + 1;
      if (attempts >= MAX_ATTEMPTS) {
        const lockUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
        await authRepository.lockAccount(user.id, lockUntil);
        throw new UnauthorizedError(`Too many failed attempts. Account locked for ${process.env.LOCKOUT_DURATION_MINUTES || 30} minutes.`);
      }
      await authRepository.incrementLoginAttempts(user.id);
      throw new UnauthorizedError(`Invalid email or password. ${MAX_ATTEMPTS - attempts} attempt(s) remaining.`);
    }

    // Extract permissions from role
    const permissions = (user.roleData?.permissions || []).map((p) => p.name);

    // Issue tokens
    const accessToken = tokenService.generateAccessToken(user, permissions);
    const refreshToken = await tokenService.generateRefreshToken(user.id, ipAddress);

    // Cache permissions
    await tokenService.cacheUserPermissions(user.id, permissions);

    // Update last login
    await authRepository.updateLastLogin(user.id, ipAddress);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organizationId: user.organizationId,
        branchId: user.branchId,
        isEmailVerified: user.isEmailVerified,
        mustChangePassword: user.mustChangePassword,
      },
    };
  }

  /**
   * Logout — blacklist access token and revoke refresh token
   */
  async logout(userId, accessToken, refreshToken) {
    await Promise.all([
      tokenService.blacklistAccessToken(accessToken),
      refreshToken ? tokenService.revokeRefreshToken(userId, refreshToken) : Promise.resolve(),
      tokenService.clearCachedPermissions(userId),
    ]);
  }

  /**
   * Rotate refresh token and issue new access token
   */
  async refreshAccessToken(userId, refreshToken, ipAddress) {
    const stored = await tokenService.validateRefreshToken(userId, refreshToken);
    if (!stored) throw new UnauthorizedError('Invalid or expired refresh token. Please log in again.');

    const user = await authRepository.findWithPermissions(userId);
    if (!user || user.status !== 'active') throw new UnauthorizedError('User account is not active.');

    const permissions = (user.roleData?.permissions || []).map((p) => p.name);
    const newAccessToken = tokenService.generateAccessToken(user, permissions);
    const newRefreshToken = await tokenService.rotateRefreshToken(userId, refreshToken, ipAddress);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token) {
    const user = await authRepository.findByEmailVerificationToken(token);
    if (!user) throw new AppError('Invalid or expired verification token.', 400);

    await user.update({
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
      emailVerificationToken: null,
      emailVerificationExpires: null,
    });
    return user.toSafeJSON();
  }

  /**
   * Send password reset email
   */
  async forgotPassword(email) {
    const user = await authRepository.findByEmail(email.toLowerCase());
    if (!user) return; // Never reveal if email exists

    const resetToken = generateSecureToken();
    const resetExpiry = new Date(Date.now() + 2 * 60 * 60 * 1000);

    await user.update({ passwordResetToken: resetToken, passwordResetExpires: resetExpiry });
    await emailService.sendPasswordResetEmail(user, resetToken);
    logger.info(`Password reset token issued for: ${email}`);
  }

  /**
   * Reset password using token
   */
  async resetPassword(token, newPassword) {
    const user = await authRepository.findByPasswordResetToken(token);
    if (!user) throw new AppError('Invalid or expired password reset token.', 400);

    await user.update({
      password: newPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
      loginAttempts: 0,
      lockedUntil: null,
    });
    await tokenService.clearCachedPermissions(user.id);
    return user.toSafeJSON();
  }

  /**
   * Change password (requires current password)
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findByPk(userId);
    if (!user) throw new NotFoundError('User not found.');

    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) throw new UnauthorizedError('Current password is incorrect.');

    await user.update({ password: newPassword, mustChangePassword: false });
    await tokenService.clearCachedPermissions(userId);
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(userId) {
    const user = await User.findByPk(userId);
    if (!user) throw new NotFoundError('User not found.');
    if (user.isEmailVerified) throw new AppError('Email is already verified.', 400);

    const token = generateSecureToken();
    await user.update({
      emailVerificationToken: token,
      emailVerificationExpires: new Date(Date.now() + 48 * 60 * 60 * 1000),
    });
    await emailService.sendVerificationEmail(user, token);
  }
}

export default new AuthService();
