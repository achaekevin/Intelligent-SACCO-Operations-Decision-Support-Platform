import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Branch = sequelize.define('Branch', {
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
  name: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: 'Branch code within the organization e.g. BR-001',
  },
  email: {
    type: DataTypes.STRING(150),
    validate: { isEmail: true },
  },
  phone: DataTypes.STRING(20),
  address: DataTypes.TEXT,
  county: DataTypes.STRING(100),
  town: DataTypes.STRING(100),
  managerId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'users', key: 'id' },
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
  },
  isHeadquarters: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'branches',
  paranoid: true,
  indexes: [
    { fields: ['organizationId'] },
    { unique: true, fields: ['organizationId', 'code'] },
    { fields: ['status'] },
  ],
});

export default Branch;
