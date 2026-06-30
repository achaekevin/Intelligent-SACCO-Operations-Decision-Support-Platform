module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('roles', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      organizationId: { type: Sequelize.UUID, allowNull: true, references: { model: 'organizations', key: 'id' } },
      name: { type: Sequelize.STRING(50), allowNull: false },
      slug: { type: Sequelize.STRING(50), allowNull: false },
      description: Sequelize.STRING(255),
      isSystem: { type: Sequelize.BOOLEAN, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
      deletedAt: { type: Sequelize.DATE, allowNull: true },
    });

    await queryInterface.createTable('permissions', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      name: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      module: { type: Sequelize.STRING(50), allowNull: false },
      description: Sequelize.STRING(255),
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('role_permissions', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      roleId: { type: Sequelize.UUID, references: { model: 'roles', key: 'id' }, onDelete: 'CASCADE' },
      permissionId: { type: Sequelize.UUID, references: { model: 'permissions', key: 'id' }, onDelete: 'CASCADE' },
    });

    await queryInterface.addIndex('roles', ['slug', 'organizationId']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('role_permissions');
    await queryInterface.dropTable('permissions');
    await queryInterface.dropTable('roles');
  }
};
