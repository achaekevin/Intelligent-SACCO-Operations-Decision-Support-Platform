module.exports = {
  up: async (queryInterface, Sequelize) => {
  // ─── Loan Products ─────────────────────────────────────────────
  await queryInterface.createTable('loan_products', {
    id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
    organizationId: { type: Sequelize.UUID, allowNull: false, references: { model: 'organizations', key: 'id' } },
    name: { type: Sequelize.STRING(100), allowNull: false },
    code: { type: Sequelize.STRING(20), allowNull: false },
    type: { type: Sequelize.ENUM('emergency','development','school_fees','business','asset_financing','personal'), allowNull: false },
    interestRate: { type: Sequelize.DECIMAL(5,2), allowNull: false },
    interestMethod: { type: Sequelize.ENUM('flat','reducing_balance'), defaultValue: 'reducing_balance' },
    minAmount: { type: Sequelize.DECIMAL(15,2), allowNull: false },
    maxAmount: { type: Sequelize.DECIMAL(15,2), allowNull: false },
    minTermMonths: { type: Sequelize.INTEGER, allowNull: false },
    maxTermMonths: { type: Sequelize.INTEGER, allowNull: false },
    processingFeePercent: { type: Sequelize.DECIMAL(5,2), defaultValue: 0 },
    insuranceFeePercent: { type: Sequelize.DECIMAL(5,2), defaultValue: 0 },
    penaltyRate: { type: Sequelize.DECIMAL(5,2), defaultValue: 0 },
    gracePeriodDays: { type: Sequelize.INTEGER, defaultValue: 0 },
    requiresGuarantor: { type: Sequelize.BOOLEAN, defaultValue: true },
    minGuarantors: { type: Sequelize.INTEGER, defaultValue: 1 },
    multiplierOfSavings: { type: Sequelize.DECIMAL(5,2), defaultValue: 3 },
    isActive: { type: Sequelize.BOOLEAN, defaultValue: true },
    createdAt: { type: Sequelize.DATE, allowNull: false },
    updatedAt: { type: Sequelize.DATE, allowNull: false },
    deletedAt: { type: Sequelize.DATE, allowNull: true },
  });

  // ─── Loans ─────────────────────────────────────────────────────
  await queryInterface.createTable('loans', {
    id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
    organizationId: { type: Sequelize.UUID, allowNull: false },
    branchId: { type: Sequelize.UUID, allowNull: false },
    memberId: { type: Sequelize.UUID, allowNull: false, references: { model: 'members', key: 'id' } },
    loanProductId: { type: Sequelize.UUID, allowNull: false, references: { model: 'loan_products', key: 'id' } },
    loanNumber: { type: Sequelize.STRING(30), allowNull: false },
    type: { type: Sequelize.STRING(50), allowNull: false },
    principalAmount: { type: Sequelize.DECIMAL(15,2), allowNull: false },
    interestRate: { type: Sequelize.DECIMAL(5,2), allowNull: false },
    interestMethod: { type: Sequelize.ENUM('flat','reducing_balance'), defaultValue: 'reducing_balance' },
    termMonths: { type: Sequelize.INTEGER, allowNull: false },
    processingFee: { type: Sequelize.DECIMAL(15,2), defaultValue: 0 },
    insuranceFee: { type: Sequelize.DECIMAL(15,2), defaultValue: 0 },
    totalInterest: { type: Sequelize.DECIMAL(15,2), defaultValue: 0 },
    totalRepayable: { type: Sequelize.DECIMAL(15,2), defaultValue: 0 },
    monthlyInstallment: { type: Sequelize.DECIMAL(15,2), defaultValue: 0 },
    principalBalance: { type: Sequelize.DECIMAL(15,2), defaultValue: 0 },
    interestBalance: { type: Sequelize.DECIMAL(15,2), defaultValue: 0 },
    penaltiesBalance: { type: Sequelize.DECIMAL(15,2), defaultValue: 0 },
    totalPaid: { type: Sequelize.DECIMAL(15,2), defaultValue: 0 },
    purpose: { type: Sequelize.TEXT, allowNull: true },
    status: { type: Sequelize.ENUM('pending','under_review','approved','rejected','disbursed','completed','defaulted','restructured'), defaultValue: 'pending' },
    applicationDate: { type: Sequelize.DATEONLY, allowNull: false },
    approvedAt: { type: Sequelize.DATE, allowNull: true },
    approvedBy: { type: Sequelize.UUID, allowNull: true },
    rejectedAt: { type: Sequelize.DATE, allowNull: true },
    rejectedBy: { type: Sequelize.UUID, allowNull: true },
    rejectionReason: { type: Sequelize.TEXT, allowNull: true },
    disbursedAt: { type: Sequelize.DATE, allowNull: true },
    disbursedBy: { type: Sequelize.UUID, allowNull: true },
    disbursementMethod: { type: Sequelize.ENUM('cash','mpesa','bank_transfer','account_credit'), allowNull: true },
    disbursementReference: { type: Sequelize.STRING(100), allowNull: true },
    firstRepaymentDate: { type: Sequelize.DATEONLY, allowNull: true },
    lastRepaymentDate: { type: Sequelize.DATEONLY, allowNull: true },
    closedAt: { type: Sequelize.DATE, allowNull: true },
    closedBy: { type: Sequelize.UUID, allowNull: true },
    isRestructured: { type: Sequelize.BOOLEAN, defaultValue: false },
    parentLoanId: { type: Sequelize.UUID, allowNull: true },
    officerId: { type: Sequelize.UUID, allowNull: true },
    notes: { type: Sequelize.TEXT, allowNull: true },
    createdAt: { type: Sequelize.DATE, allowNull: false },
    updatedAt: { type: Sequelize.DATE, allowNull: false },
    deletedAt: { type: Sequelize.DATE, allowNull: true },
  });

  // ─── Loan Repayments ───────────────────────────────────────────
  await queryInterface.createTable('loan_repayments', {
    id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
    organizationId: { type: Sequelize.UUID, allowNull: false },
    loanId: { type: Sequelize.UUID, allowNull: false, references: { model: 'loans', key: 'id' } },
    memberId: { type: Sequelize.UUID, allowNull: false },
    reference: { type: Sequelize.STRING(50), allowNull: false, unique: true },
    installmentNumber: { type: Sequelize.INTEGER, allowNull: true },
    dueDate: { type: Sequelize.DATEONLY, allowNull: false },
    dueAmount: { type: Sequelize.DECIMAL(15,2), allowNull: false },
    principalDue: { type: Sequelize.DECIMAL(15,2), defaultValue: 0 },
    interestDue: { type: Sequelize.DECIMAL(15,2), defaultValue: 0 },
    penaltyDue: { type: Sequelize.DECIMAL(15,2), defaultValue: 0 },
    amountPaid: { type: Sequelize.DECIMAL(15,2), defaultValue: 0 },
    principalPaid: { type: Sequelize.DECIMAL(15,2), defaultValue: 0 },
    interestPaid: { type: Sequelize.DECIMAL(15,2), defaultValue: 0 },
    penaltyPaid: { type: Sequelize.DECIMAL(15,2), defaultValue: 0 },
    paymentDate: { type: Sequelize.DATE, allowNull: true },
    paymentMethod: { type: Sequelize.ENUM('cash','mpesa','bank_transfer','account_debit'), allowNull: true },
    externalReference: { type: Sequelize.STRING(100), allowNull: true },
    status: { type: Sequelize.ENUM('pending','partial','paid','overdue'), defaultValue: 'pending' },
    processedBy: { type: Sequelize.UUID, allowNull: true },
    createdAt: { type: Sequelize.DATE, allowNull: false },
    updatedAt: { type: Sequelize.DATE, allowNull: false },
  });

  // ─── Guarantors ────────────────────────────────────────────────
  await queryInterface.createTable('guarantors', {
    id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
    organizationId: { type: Sequelize.UUID, allowNull: false },
    loanId: { type: Sequelize.UUID, allowNull: false, references: { model: 'loans', key: 'id' } },
    memberId: { type: Sequelize.UUID, allowNull: false, references: { model: 'members', key: 'id' } },
    amountGuaranteed: { type: Sequelize.DECIMAL(15,2), allowNull: false },
    remainingLiability: { type: Sequelize.DECIMAL(15,2), defaultValue: 0 },
    status: { type: Sequelize.ENUM('pending','accepted','declined','released'), defaultValue: 'pending' },
    acceptedAt: { type: Sequelize.DATE, allowNull: true },
    releasedAt: { type: Sequelize.DATE, allowNull: true },
    releasedBy: { type: Sequelize.UUID, allowNull: true },
    createdAt: { type: Sequelize.DATE, allowNull: false },
    updatedAt: { type: Sequelize.DATE, allowNull: false },
    deletedAt: { type: Sequelize.DATE, allowNull: true },
  });

  // Indexes
  await queryInterface.addIndex('loans', ['organizationId', 'loanNumber'], { unique: true });
  await queryInterface.addIndex('loans', ['memberId']);
  await queryInterface.addIndex('loans', ['organizationId']);
  await queryInterface.addIndex('loans', ['branchId']);
  await queryInterface.addIndex('loans', ['status']);
  await queryInterface.addIndex('loan_repayments', ['loanId']);
  await queryInterface.addIndex('loan_repayments', ['memberId']);
  await queryInterface.addIndex('loan_repayments', ['dueDate']);
  await queryInterface.addIndex('loan_repayments', ['status']);
  await queryInterface.addIndex('guarantors', ['loanId']);
  await queryInterface.addIndex('guarantors', ['memberId']);
},

  down: async (queryInterface) => {
  await queryInterface.dropTable('guarantors');
  await queryInterface.dropTable('loan_repayments');
  await queryInterface.dropTable('loans');
  await queryInterface.dropTable('loan_products');
    }
};