import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export const NextOfKin = sequelize.define('NextOfKin', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  memberId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'members', key: 'id' },
  },
  organizationId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  firstName: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  relationship: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  email: DataTypes.STRING(150),
  nationalId: DataTypes.STRING(30),
  address: DataTypes.TEXT,
  sharePercentage: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 100,
    comment: 'Percentage of benefits allocated to this next of kin',
  },
  isPrimary: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'next_of_kin',
  paranoid: true,
});

export const MemberDocument = sequelize.define('MemberDocument', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  memberId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'members', key: 'id' },
  },
  organizationId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('national_id', 'passport', 'kra_pin', 'payslip', 'utility_bill', 'bank_statement', 'other'),
    allowNull: false,
  },
  fileName: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  filePath: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  mimeType: DataTypes.STRING(100),
  fileSize: DataTypes.INTEGER,
  uploadedBy: DataTypes.UUID,
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  verifiedBy: DataTypes.UUID,
  verifiedAt: DataTypes.DATE,
}, {
  tableName: 'member_documents',
  paranoid: true,
});
