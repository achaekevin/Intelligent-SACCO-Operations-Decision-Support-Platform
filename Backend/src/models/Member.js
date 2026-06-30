import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { MEMBER_STATUSES } from '../constants/index.js';

const Member = sequelize.define('Member', {
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
  memberNumber: {
    type: DataTypes.STRING(30),
    allowNull: false,
    comment: 'e.g. MBR-20240001',
  },
  firstName: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  otherNames: DataTypes.STRING(100),
  email: {
    type: DataTypes.STRING(150),
    validate: { isEmail: true },
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  alternativePhone: DataTypes.STRING(20),
  nationalId: {
    type: DataTypes.STRING(30),
    allowNull: false,
  },
  dateOfBirth: DataTypes.DATEONLY,
  gender: DataTypes.ENUM('male', 'female', 'other'),
  maritalStatus: DataTypes.ENUM('single', 'married', 'divorced', 'widowed'),
  occupation: DataTypes.STRING(150),
  employer: DataTypes.STRING(150),
  monthlyIncome: DataTypes.DECIMAL(15, 2),
  address: DataTypes.TEXT,
  county: DataTypes.STRING(100),
  subCounty: DataTypes.STRING(100),
  town: DataTypes.STRING(100),
  postalAddress: DataTypes.STRING(100),
  photo: DataTypes.STRING(500),
  signatureImage: DataTypes.STRING(500),
  joiningDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  exitDate: DataTypes.DATEONLY,
  status: {
    type: DataTypes.ENUM(...Object.values(MEMBER_STATUSES)),
    defaultValue: MEMBER_STATUSES.PENDING,
  },
  isShareholderActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  loyaltyTier: {
    type: DataTypes.ENUM('bronze', 'silver', 'gold', 'platinum'),
    defaultValue: 'bronze',
  },
  loyaltyPoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  notes: DataTypes.TEXT,
  activatedAt: DataTypes.DATE,
  activatedBy: DataTypes.UUID,
  suspendedAt: DataTypes.DATE,
  suspendedBy: DataTypes.UUID,
  suspensionReason: DataTypes.TEXT,
}, {
  tableName: 'members',
  paranoid: true,
  indexes: [
    { unique: true, fields: ['organizationId', 'memberNumber'] },
    { unique: true, fields: ['organizationId', 'nationalId'] },
    { fields: ['organizationId'] },
    { fields: ['branchId'] },
    { fields: ['status'] },
    { fields: ['phone'] },
  ],
});

export default Member;
