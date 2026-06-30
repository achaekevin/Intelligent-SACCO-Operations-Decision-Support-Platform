import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  organizationId: {
    type: DataTypes.UUID,
    allowNull: true, // null = system-level role
    references: { model: 'organizations', key: 'id' },
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'machine-friendly: super_admin, sacco_admin, cashier …',
  },
  description: DataTypes.STRING(255),
  isSystem: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'System roles cannot be deleted',
  },
}, {
  tableName: 'roles',
  paranoid: true,
  indexes: [{ unique: true, fields: ['slug', 'organizationId'] }],
});

export const Permission = sequelize.define('Permission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: 'e.g. loan:approve',
  },
  module: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'e.g. loan, savings, member',
  },
  description: DataTypes.STRING(255),
}, {
  tableName: 'permissions',
  paranoid: false,
});

export const RolePermission = sequelize.define('RolePermission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  roleId: {
    type: DataTypes.UUID,
    references: { model: 'roles', key: 'id' },
  },
  permissionId: {
    type: DataTypes.UUID,
    references: { model: 'permissions', key: 'id' },
  },
}, {
  tableName: 'role_permissions',
  timestamps: false,
});
