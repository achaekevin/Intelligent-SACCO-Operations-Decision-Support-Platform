module.exports = {
  up: async (queryInterface, Sequelize) => {
  await queryInterface.createTable('savings_accounts', {
    id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
    organizationId: { type: Sequelize.UUID, allowNull: false },
    branchId: { type: Sequelize.UUID, allowNull: false },
    memberId: { type: Sequelize.UUID, allowNull: false, references: { model: 'members', key: 'id' } },
    accountNumber: { type: Sequelize.STRING(30), allowNull: false, unique: true },
    accountType: { type: Sequelize.ENUM('ordinary', 'share_capital', 'fixed_deposit'), allowNull: false },
    balance: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0.00 },
    availableBalance: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0.00 },
    interestRate: { type: Sequelize.DECIMAL(5, 2), defaultValue: 0 },
    minimumBalance: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
    maturityDate: Sequelize.DATEONLY,
    maturityAmount: Sequelize.DECIMAL(15, 2),
    fixedDepositAmount: Sequelize.DECIMAL(15, 2),
    fixedDepositDurationMonths: Sequelize.INTEGER,
    autoRenew: { type: Sequelize.BOOLEAN, defaultValue: false },
    status: { type: Sequelize.ENUM('active', 'dormant', 'closed', 'frozen'), defaultValue: 'active' },
    lastTransactionAt: Sequelize.DATE,
    closedAt: Sequelize.DATE,
    closedBy: Sequelize.UUID,
    closureReason: Sequelize.TEXT,
    createdAt: { type: Sequelize.DATE, allowNull: false },
    updatedAt: { type: Sequelize.DATE, allowNull: false },
    deletedAt: { type: Sequelize.DATE, allowNull: true },
  });

  await queryInterface.createTable('savings_transactions', {
    id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
    organizationId: { type: Sequelize.UUID, allowNull: false },
    branchId: { type: Sequelize.UUID, allowNull: false },
    savingsAccountId: { type: Sequelize.UUID, allowNull: false, references: { model: 'savings_accounts', key: 'id' } },
    memberId: { type: Sequelize.UUID, allowNull: false },
    reference: { type: Sequelize.STRING(50), allowNull: false, unique: true },
    type: {
      type: Sequelize.ENUM('deposit', 'withdrawal', 'transfer', 'loan_disbursement', 'loan_repayment', 'interest_credit', 'penalty', 'reversal', 'fee'),
      allowNull: false,
    },
    amount: { type: Sequelize.DECIMAL(15, 2), allowNull: false },
    balanceBefore: { type: Sequelize.DECIMAL(15, 2), allowNull: false },
    balanceAfter: { type: Sequelize.DECIMAL(15, 2), allowNull: false },
    description: Sequelize.STRING(255),
    paymentMethod: { type: Sequelize.ENUM('cash', 'mpesa', 'bank_transfer', 'cheque', 'internal'), defaultValue: 'cash' },
    externalReference: Sequelize.STRING(100),
    status: { type: Sequelize.ENUM('pending', 'completed', 'failed', 'reversed'), defaultValue: 'completed' },
    reversedAt: Sequelize.DATE,
    reversedBy: Sequelize.UUID,
    reversalReason: Sequelize.TEXT,
    originalTransactionId: Sequelize.UUID,
    processedBy: { type: Sequelize.UUID, allowNull: false },
    approvedBy: Sequelize.UUID,
    approvedAt: Sequelize.DATE,
    metadata: Sequelize.JSON,
    createdAt: { type: Sequelize.DATE, allowNull: false },
    updatedAt: { type: Sequelize.DATE, allowNull: false },
  });

  await queryInterface.addIndex('savings_accounts', ['accountNumber'], { unique: true });
  await queryInterface.addIndex('savings_accounts', ['memberId']);
  await queryInterface.addIndex('savings_accounts', ['organizationId']);
  await queryInterface.addIndex('savings_transactions', ['reference'], { unique: true });
  await queryInterface.addIndex('savings_transactions', ['savingsAccountId']);
  await queryInterface.addIndex('savings_transactions', ['memberId']);
  await queryInterface.addIndex('savings_transactions', ['organizationId']);
},

  down: async (queryInterface) => {
  await queryInterface.dropTable('savings_transactions');
  await queryInterface.dropTable('savings_accounts');
    }
};