module.exports = {
  up: async (queryInterface, Sequelize) => {
  // ─── Branches ──────────────────────────────────────────────────
  await queryInterface.createTable('branches', {
    id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
    organizationId: { type: Sequelize.UUID, allowNull: false, references: { model: 'organizations', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
    name: { type: Sequelize.STRING(150), allowNull: false },
    code: { type: Sequelize.STRING(20), allowNull: false },
    email: { type: Sequelize.STRING(150), allowNull: true },
    phone: { type: Sequelize.STRING(20), allowNull: true },
    address: { type: Sequelize.TEXT, allowNull: true },
    county: { type: Sequelize.STRING(100), allowNull: true },
    town: { type: Sequelize.STRING(100), allowNull: true },
    managerId: { type: Sequelize.UUID, allowNull: true },
    status: { type: Sequelize.ENUM('active', 'inactive'), defaultValue: 'active' },
    isHeadquarters: { type: Sequelize.BOOLEAN, defaultValue: false },
    createdAt: { type: Sequelize.DATE, allowNull: false },
    updatedAt: { type: Sequelize.DATE, allowNull: false },
    deletedAt: { type: Sequelize.DATE, allowNull: true },
  });

  await queryInterface.addIndex('branches', ['organizationId']);
  await queryInterface.addIndex('branches', ['organizationId', 'code'], { unique: true });
  await queryInterface.addIndex('branches', ['status']);

  // ─── Users ─────────────────────────────────────────────────────
  await queryInterface.createTable('users', {
    id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
    organizationId: { type: Sequelize.UUID, allowNull: true, references: { model: 'organizations', key: 'id' } },
    branchId: { type: Sequelize.UUID, allowNull: true, references: { model: 'branches', key: 'id' } },
    roleId: { type: Sequelize.UUID, allowNull: true, references: { model: 'roles', key: 'id' } },
    memberId: { type: Sequelize.UUID, allowNull: true },
    firstName: { type: Sequelize.STRING(100), allowNull: false },
    lastName: { type: Sequelize.STRING(100), allowNull: false },
    email: { type: Sequelize.STRING(150), allowNull: false, unique: true },
    phone: { type: Sequelize.STRING(20), allowNull: false },
    password: { type: Sequelize.STRING(255), allowNull: false },
    role: {
      type: Sequelize.ENUM('sacco_admin','loan_officer','cashier','auditor','member'),
      allowNull: false,
    },
    avatar: { type: Sequelize.STRING(500), allowNull: true },
    isEmailVerified: { type: Sequelize.BOOLEAN, defaultValue: false },
    emailVerifiedAt: { type: Sequelize.DATE, allowNull: true },
    emailVerificationToken: { type: Sequelize.STRING(255), allowNull: true },
    emailVerificationExpires: { type: Sequelize.DATE, allowNull: true },
    isTwoFactorEnabled: { type: Sequelize.BOOLEAN, defaultValue: false },
    twoFactorSecret: { type: Sequelize.STRING(255), allowNull: true },
    passwordResetToken: { type: Sequelize.STRING(255), allowNull: true },
    passwordResetExpires: { type: Sequelize.DATE, allowNull: true },
    lastLoginAt: { type: Sequelize.DATE, allowNull: true },
    lastLoginIp: { type: Sequelize.STRING(45), allowNull: true },
    loginAttempts: { type: Sequelize.INTEGER, defaultValue: 0 },
    lockedUntil: { type: Sequelize.DATE, allowNull: true },
    status: { type: Sequelize.ENUM('active', 'inactive', 'suspended'), defaultValue: 'active' },
    mustChangePassword: { type: Sequelize.BOOLEAN, defaultValue: false },
    createdAt: { type: Sequelize.DATE, allowNull: false },
    updatedAt: { type: Sequelize.DATE, allowNull: false },
    deletedAt: { type: Sequelize.DATE, allowNull: true },
  });

  await queryInterface.addIndex('users', ['email'], { unique: true });
  await queryInterface.addIndex('users', ['organizationId']);
  await queryInterface.addIndex('users', ['branchId']);
  await queryInterface.addIndex('users', ['role']);
  await queryInterface.addIndex('users', ['status']);
},

  down: async (queryInterface) => {
  await queryInterface.dropTable('users');
  await queryInterface.dropTable('branches');
    }
};