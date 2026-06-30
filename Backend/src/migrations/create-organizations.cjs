module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('organizations', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      name: { type: Sequelize.STRING(150), allowNull: false },
      code: { type: Sequelize.STRING(20), allowNull: false, unique: true },
      email: { type: Sequelize.STRING(150), allowNull: false, unique: true },
      phone: { type: Sequelize.STRING(20), allowNull: false },
      address: Sequelize.TEXT,
      logo: Sequelize.STRING(500),
      website: Sequelize.STRING(255),
      registrationNumber: Sequelize.STRING(100),
      subscriptionPlan: { type: Sequelize.ENUM('starter', 'professional', 'enterprise'), defaultValue: 'starter' },
      subscriptionExpiresAt: Sequelize.DATE,
      status: { type: Sequelize.ENUM('active', 'suspended', 'trial', 'expired'), defaultValue: 'trial' },
      settings: { type: Sequelize.JSON },
      maxBranches: { type: Sequelize.INTEGER, defaultValue: 1 },
      maxMembers: { type: Sequelize.INTEGER, defaultValue: 500 },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
      deletedAt: { type: Sequelize.DATE, allowNull: true },
    });
    await queryInterface.addIndex('organizations', ['code']);
    await queryInterface.addIndex('organizations', ['status']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('organizations');
  }
};


