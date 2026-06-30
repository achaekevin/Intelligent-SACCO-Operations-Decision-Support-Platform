import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export const AuditLog = sequelize.define('AuditLog', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: true },
  organizationId: { type: DataTypes.UUID, allowNull: true },
  action: { type: DataTypes.STRING(50), allowNull: false },
  module: { type: DataTypes.STRING(50), allowNull: false },
  description: DataTypes.TEXT,
  ipAddress: DataTypes.STRING(45),
  userAgent: DataTypes.STRING(500),
  metadata: DataTypes.JSON,
  statusCode: DataTypes.INTEGER,
}, {
  tableName: 'audit_logs',
  paranoid: false,
  updatedAt: false,
  indexes: [
    { fields: ['userId'] },
    { fields: ['organizationId'] },
    { fields: ['action'] },
    { fields: ['module'] },
    { fields: ['createdAt'] },
  ],
});

export const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  organizationId: { type: DataTypes.UUID, allowNull: false },
  userId: { type: DataTypes.UUID, allowNull: true },
  memberId: { type: DataTypes.UUID, allowNull: true },
  type: { type: DataTypes.STRING(50), allowNull: false },
  title: { type: DataTypes.STRING(255), allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  channel: { type: DataTypes.ENUM('in_app', 'email', 'sms'), defaultValue: 'in_app' },
  isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
  readAt: DataTypes.DATE,
  metadata: DataTypes.JSON,
}, {
  tableName: 'notifications',
  paranoid: false,
  indexes: [
    { fields: ['userId'] },
    { fields: ['memberId'] },
    { fields: ['organizationId'] },
    { fields: ['isRead'] },
  ],
});

export const MpesaTransaction = sequelize.define('MpesaTransaction', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  organizationId: { type: DataTypes.UUID, allowNull: false },
  memberId: DataTypes.UUID,
  checkoutRequestId: DataTypes.STRING(100),
  merchantRequestId: DataTypes.STRING(100),
  phoneNumber: { type: DataTypes.STRING(20), allowNull: false },
  amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  transactionType: {
    type: DataTypes.ENUM('stk_push', 'paybill', 'b2c'),
    defaultValue: 'stk_push',
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'cancelled'),
    defaultValue: 'pending',
  },
  mpesaReceiptNumber: DataTypes.STRING(50),
  resultCode: DataTypes.STRING(10),
  resultDesc: DataTypes.STRING(255),
  callbackPayload: DataTypes.JSON,
  reconciledAt: DataTypes.DATE,
  reconciledBy: DataTypes.UUID,
  linkedTransactionId: DataTypes.UUID,
}, {
  tableName: 'mpesa_transactions',
  paranoid: false,
  indexes: [
    { fields: ['checkoutRequestId'] },
    { fields: ['mpesaReceiptNumber'] },
    { fields: ['organizationId'] },
    { fields: ['status'] },
  ],
});
