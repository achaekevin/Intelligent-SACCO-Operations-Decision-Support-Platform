import { Op } from 'sequelize';
import { BaseRepository } from './BaseRepository.js';
import { User, Role, Permission } from '../models/index.js';

class AuthRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    return User.findOne({
      where: { email: email.toLowerCase() },
      include: [
        {
          model: Role,
          as: 'roleData',
          include: [{ model: Permission, as: 'permissions', through: { attributes: [] } }],
        },
      ],
    });
  }

  async findByEmailVerificationToken(token) {
    return User.findOne({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: { [Op.gt]: new Date() },
      },
    });
  }

  async findByPasswordResetToken(token) {
    return User.findOne({
      where: {
        passwordResetToken: token,
        passwordResetExpires: { [Op.gt]: new Date() },
      },
    });
  }

  async incrementLoginAttempts(userId) {
    return User.increment('loginAttempts', { where: { id: userId } });
  }

  async resetLoginAttempts(userId) {
    return User.update(
      { loginAttempts: 0, lockedUntil: null },
      { where: { id: userId } }
    );
  }

  async lockAccount(userId, until) {
    return User.update({ lockedUntil: until }, { where: { id: userId } });
  }

  async updateLastLogin(userId, ipAddress) {
    return User.update(
      { lastLoginAt: new Date(), lastLoginIp: ipAddress, loginAttempts: 0 },
      { where: { id: userId } }
    );
  }

  async findWithPermissions(userId) {
    return User.findByPk(userId, {
      include: [
        {
          model: Role,
          as: 'roleData',
          include: [{ model: Permission, as: 'permissions', through: { attributes: [] } }],
        },
      ],
    });
  }
}

export default new AuthRepository();
