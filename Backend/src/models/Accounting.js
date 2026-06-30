import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export const Account = sequelize.define('Account', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  organizationId: { type: DataTypes.UUID, allowNull: false },
  code: { type: DataTypes.STRING(20), allowNull: false },
  name: { type: DataTypes.STRING(150), allowNull: false },
  type: {
    type: DataTypes.ENUM('asset', 'liability', 'equity', 'income', 'expense'),
    allowNull: false,
  },
  category: DataTypes.STRING(100),
  normalBalance: { type: DataTypes.ENUM('debit', 'credit'), allowNull: false },
  parentId: { type: DataTypes.UUID, allowNull: true },
  balance: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
  isControl: { type: DataTypes.BOOLEAN, defaultValue: false },
  isSystem: { type: DataTypes.BOOLEAN, defaultValue: false },
  description: DataTypes.TEXT,
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'chart_of_accounts',
  paranoid: true,
  indexes: [
    { unique: true, fields: ['organizationId', 'code'] },
    { fields: ['organizationId', 'type'] },
  ],
});

export const JournalEntry = sequelize.define('JournalEntry', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  organizationId: { type: DataTypes.UUID, allowNull: false },
  branchId: DataTypes.UUID,
  reference: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  description: { type: DataTypes.STRING(255), allowNull: false },
  module: DataTypes.STRING(50),
  sourceId: DataTypes.UUID,
  totalDebit: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
  totalCredit: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
  status: { type: DataTypes.ENUM('draft', 'posted', 'reversed'), defaultValue: 'posted' },
  postedBy: DataTypes.UUID,
  reversedAt: DataTypes.DATE,
  reversedBy: DataTypes.UUID,
}, {
  tableName: 'journal_entries',
  paranoid: false,
  indexes: [{ fields: ['organizationId'] }, { fields: ['date'] }, { fields: ['module', 'sourceId'] }],
});

export const JournalLine = sequelize.define('JournalLine', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  journalEntryId: { type: DataTypes.UUID, allowNull: false, references: { model: 'journal_entries', key: 'id' } },
  accountId: { type: DataTypes.UUID, allowNull: false, references: { model: 'chart_of_accounts', key: 'id' } },
  organizationId: { type: DataTypes.UUID, allowNull: false },
  type: { type: DataTypes.ENUM('debit', 'credit'), allowNull: false },
  amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  description: DataTypes.STRING(255),
  memberId: DataTypes.UUID,
}, {
  tableName: 'journal_lines',
  timestamps: false,
  indexes: [{ fields: ['journalEntryId'] }, { fields: ['accountId'] }],
});
