import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import sequelize from '../config/database.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  organizationId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'organizations', key: 'id' },
  },
  branchId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'branches', key: 'id' },
  },
  roleId: {
    type: DataTypes.UUID,
    references: { model: 'roles', key: 'id' },
  },
  memberId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'members', key: 'id' },
    comment: 'Linked member record if user is a member',
  },
  firstName: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM(
      'sacco_admin', 'loan_officer', 'cashier', 'auditor', 'member'
    ),
    allowNull: false,
  },
  avatar: DataTypes.STRING(500),
  isEmailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  emailVerifiedAt: DataTypes.DATE,
  emailVerificationToken: DataTypes.STRING(255),
  emailVerificationExpires: DataTypes.DATE,
  isTwoFactorEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  twoFactorSecret: DataTypes.STRING(255),
  passwordResetToken: DataTypes.STRING(255),
  passwordResetExpires: DataTypes.DATE,
  lastLoginAt: DataTypes.DATE,
  lastLoginIp: DataTypes.STRING(45),
  loginAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  lockedUntil: DataTypes.DATE,
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended'),
    defaultValue: 'active',
  },
  mustChangePassword: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'users',
  paranoid: true,
  indexes: [
    { fields: ['email'] },
    { fields: ['organizationId'] },
    { fields: ['branchId'] },
    { fields: ['role'] },
    { fields: ['status'] },
  ],
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, parseInt(process.env.BCRYPT_ROUNDS) || 12);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, parseInt(process.env.BCRYPT_ROUNDS) || 12);
      }
    },
  },
});

// Instance methods
User.prototype.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

User.prototype.isLocked = function () {
  return this.lockedUntil && new Date() < new Date(this.lockedUntil);
};

User.prototype.toSafeJSON = function () {
  const { password, twoFactorSecret, passwordResetToken, emailVerificationToken, ...safe } = this.toJSON();
  return safe;
};

export default User;
