import authService from '../services/authService.js';
import { successResponse, createdResponse, errorResponse } from '../utils/response.js';
import logger from '../utils/logger.js';

class AuthController {
  /**
   * POST /api/v1/auth/register
   * Register a new SACCO organization with admin account
   */
  async register(req, res, next) {
    try {
      const result = await authService.registerOrganization(req.body);
      return createdResponse(res, {
        message: 'Organization registered successfully. Check your email to verify your account.',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/auth/login
   */
  async login(req, res, next) {
    try {
      const ipAddress = req.ip || req.connection?.remoteAddress;
      const result = await authService.login({ ...req.body, ipAddress });

      // Set refresh token in HTTP-only cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return successResponse(res, { message: 'Login successful.', data: result });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/auth/logout
   */
  async logout(req, res, next) {
    try {
      const accessToken = req.headers.authorization?.split(' ')[1];
      const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
      await authService.logout(req.user.id, accessToken, refreshToken);
      res.clearCookie('refreshToken');
      return successResponse(res, { message: 'Logged out successfully.' });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/auth/refresh
   */
  async refresh(req, res, next) {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
      const userId = req.body?.userId;
      const ipAddress = req.ip;

      if (!refreshToken || !userId) {
        return errorResponse(res, { message: 'Refresh token and userId are required.', statusCode: 400 });
      }

      const result = await authService.refreshAccessToken(userId, refreshToken, ipAddress);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return successResponse(res, { message: 'Token refreshed.', data: { accessToken: result.accessToken } });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/auth/verify-email
   */
  async verifyEmail(req, res, next) {
    try {
      const user = await authService.verifyEmail(req.body.token);
      return successResponse(res, { message: 'Email verified successfully.', data: user });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/auth/resend-verification
   */
  async resendVerification(req, res, next) {
    try {
      await authService.resendVerificationEmail(req.user.id);
      return successResponse(res, { message: 'Verification email sent.' });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/auth/forgot-password
   */
  async forgotPassword(req, res, next) {
    try {
      await authService.forgotPassword(req.body.email);
      return successResponse(res, {
        message: 'If that email exists, a password reset link has been sent.',
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/auth/reset-password
   */
  async resetPassword(req, res, next) {
    try {
      await authService.resetPassword(req.body.token, req.body.newPassword);
      return successResponse(res, { message: 'Password reset successfully. Please log in.' });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/auth/change-password
   */
  async changePassword(req, res, next) {
    try {
      await authService.changePassword(req.user.id, req.body.currentPassword, req.body.newPassword);
      return successResponse(res, { message: 'Password changed successfully.' });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/auth/me
   */
  async me(req, res, next) {
    try {
      const { User, Role, Permission } = await import('../models/index.js');
      const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password', 'emailVerificationToken', 'passwordResetToken', 'twoFactorSecret'] },
        include: [{ model: Role, as: 'roleData', include: [{ model: Permission, as: 'permissions', through: { attributes: [] } }] }],
      });
      return successResponse(res, { data: user });
    } catch (err) {
      next(err);
    }
  }
}

export default new AuthController();
