import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { SAVINGS_ACCOUNT_TYPES, TRANSACTION_TYPES, TRANSACTION_STATUSES } from '../constants/index.js';

export const SavingsAccount = sequelize.define('SavingsAccount', {
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
    allowNull: false,
    references: { model: 'branches', key: 'id' },
  },
  memberId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'members', key: 'id' },
  },
  accountNumber: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true,
  },
  accountType: {
    type: DataTypes.ENUM(...Object.values(SAVINGS_ACCOUNT_TYPES)),
    allowNull: false,
  },
  balance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00,
  },
  availableBalance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00,
    comment: 'Balance minus any holds/liens',
  },
  interestRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    comment: 'Annual interest rate percentage',
  },
  minimumBalance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  // Fixed deposit specific
  maturityDate: DataTypes.DATEONLY,
  maturityAmount: DataTypes.DECIMAL(15, 2),
  fixedDepositAmount: DataTypes.DECIMAL(15, 2),
  fixedDepositDurationMonths: DataTypes.INTEGER,
  autoRenew: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  status: {
    type: DataTypes.ENUM('active', 'dormant', 'closed', 'frozen'),
    defaultValue: 'active',
  },
  lastTransactionAt: DataTypes.DATE,
  closedAt: DataTypes.DATE,
  closedBy: DataTypes.UUID,
  closureReason: DataTypes.TEXT,
}, {
  tableName: 'savings_accounts',
  paranoid: true,
  indexes: [
    { unique: true, fields: ['accountNumber'] },
    { fields: ['memberId'] },
    { fields: ['organizationId'] },
    { fields: ['branchId'] },
    { fields: ['accountType'] },
    { fields: ['status'] },
  ],
});

export const SavingsTransaction = sequelize.define('SavingsTransaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  organizationId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  branchId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  savingsAccountId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'savings_accounts', key: 'id' },
  },
  memberId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'members', key: 'id' },
  },
  reference: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  type: {
    type: DataTypes.ENUM(...Object.values(TRANSACTION_TYPES)),
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  balanceBefore: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  balanceAfter: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  description: DataTypes.STRING(255),
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'mpesa', 'bank_transfer', 'cheque', 'internal'),
    defaultValue: 'cash',
  },
  externalReference: {
    type: DataTypes.STRING(100),
    comment: 'M-Pesa receipt, cheque number, bank ref, etc.',
  },
  status: {
    type: DataTypes.ENUM(...Object.values(TRANSACTION_STATUSES)),
    defaultValue: TRANSACTION_STATUSES.COMPLETED,
  },
  reversedAt: DataTypes.DATE,
  reversedBy: DataTypes.UUID,
  reversalReason: DataTypes.TEXT,
  originalTransactionId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'Set when this transaction is a reversal',
  },
  processedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'User (cashier/system) who processed this transaction',
  },
  approvedBy: DataTypes.UUID,
  approvedAt: DataTypes.DATE,
  metadata: DataTypes.JSON,
}, {
  tableName: 'savings_transactions',
  paranoid: false, // transactions are never soft-deleted; reversals create new records
  indexes: [
    { unique: true, fields: ['reference'] },
    { fields: ['savingsAccountId'] },
    { fields: ['memberId'] },
    { fields: ['organizationId'] },
    { fields: ['type'] },
    { fields: ['status'] },
    { fields: ['createdAt'] },
  ],
});
