module.exports = {
  up: async (queryInterface, Sequelize) => {
  await queryInterface.createTable('members', {
    id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
    organizationId: { type: Sequelize.UUID, allowNull: false, references: { model: 'organizations', key: 'id' } },
    branchId: { type: Sequelize.UUID, allowNull: false, references: { model: 'branches', key: 'id' } },
    memberNumber: { type: Sequelize.STRING(30), allowNull: false },
    firstName: { type: Sequelize.STRING(100), allowNull: false },
    lastName: { type: Sequelize.STRING(100), allowNull: false },
    otherNames: Sequelize.STRING(100),
    email: Sequelize.STRING(150),
    phone: { type: Sequelize.STRING(20), allowNull: false },
    alternativePhone: Sequelize.STRING(20),
    nationalId: { type: Sequelize.STRING(30), allowNull: false },
    dateOfBirth: Sequelize.DATEONLY,
    gender: Sequelize.ENUM('male', 'female', 'other'),
    maritalStatus: Sequelize.ENUM('single', 'married', 'divorced', 'widowed'),
    occupation: Sequelize.STRING(150),
    employer: Sequelize.STRING(150),
    monthlyIncome: { type: Sequelize.DECIMAL(15, 2) },
    address: Sequelize.TEXT,
    county: Sequelize.STRING(100),
    subCounty: Sequelize.STRING(100),
    town: Sequelize.STRING(100),
    postalAddress: Sequelize.STRING(100),
    photo: Sequelize.STRING(500),
    signatureImage: Sequelize.STRING(500),
    joiningDate: { type: Sequelize.DATEONLY, allowNull: false, defaultValue: Sequelize.literal('(CURRENT_DATE)') },
    exitDate: Sequelize.DATEONLY,
    status: { type: Sequelize.ENUM('active', 'inactive', 'suspended', 'pending'), defaultValue: 'pending' },
    isShareholderActive: { type: Sequelize.BOOLEAN, defaultValue: true },
    loyaltyTier: { type: Sequelize.ENUM('bronze', 'silver', 'gold', 'platinum'), defaultValue: 'bronze' },
    loyaltyPoints: { type: Sequelize.INTEGER, defaultValue: 0 },
    notes: Sequelize.TEXT,
    activatedAt: Sequelize.DATE,
    activatedBy: Sequelize.UUID,
    suspendedAt: Sequelize.DATE,
    suspendedBy: Sequelize.UUID,
    suspensionReason: Sequelize.TEXT,
    createdAt: { type: Sequelize.DATE, allowNull: false },
    updatedAt: { type: Sequelize.DATE, allowNull: false },
    deletedAt: { type: Sequelize.DATE, allowNull: true },
  });

  await queryInterface.addIndex('members', ['organizationId', 'memberNumber'], { unique: true });
  await queryInterface.addIndex('members', ['organizationId', 'nationalId'], { unique: true });
  await queryInterface.addIndex('members', ['organizationId']);
  await queryInterface.addIndex('members', ['branchId']);
  await queryInterface.addIndex('members', ['status']);
  await queryInterface.addIndex('members', ['phone']);
},

  down: async (queryInterface) => {
  await queryInterface.dropTable('members');
    }
};