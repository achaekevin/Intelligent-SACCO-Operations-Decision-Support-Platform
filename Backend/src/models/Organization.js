import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Organization = sequelize.define('Organization', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    comment: 'Short SACCO code e.g. KUSA001',
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
  address: DataTypes.TEXT,
  logo: DataTypes.STRING(500),
  website: DataTypes.STRING(255),
  registrationNumber: {
    type: DataTypes.STRING(100),
    comment: 'SACCO Act registration number',
  },
  subscriptionPlan: {
    type: DataTypes.ENUM('starter', 'professional', 'enterprise'),
    defaultValue: 'starter',
  },
  subscriptionExpiresAt: DataTypes.DATE,
  status: {
    type: DataTypes.ENUM('active', 'suspended', 'trial', 'expired'),
    defaultValue: 'trial',
  },
  settings: {
    type: DataTypes.JSON,
    defaultValue: {
      currency: 'KES',
      timezone: 'Africa/Nairobi',
      interestMethod: 'reducing_balance',
      fiscalYearStart: '01-01',
      enableMpesa: true,
      enableSMS: false,
      loanApprovalLevels: 2,
    },
  },
  maxBranches: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  maxMembers: {
    type: DataTypes.INTEGER,
    defaultValue: 500,
  },
}, {
  tableName: 'organizations',
  paranoid: true,
  indexes: [
    { fields: ['code'] },
    { fields: ['status'] },
  ],
});

export default Organization;
