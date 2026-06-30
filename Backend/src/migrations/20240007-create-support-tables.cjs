module.exports = {
  up: async (queryInterface, Sequelize) => {
  // ─── Chart of Accounts ──────────────────────────────────────────
  await queryInterface.createTable('chart_of_accounts', {
    id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
    organizationId: { type: Sequelize.UUID, allowNull: false },
    code: { type: Sequelize.STRING(20), allowNull: false },
    name: { type: Sequelize.STRING(150), allowNull: false },
    type: { type: Sequelize.ENUM('asset','liability','equity','income','expense'), allowNull: false },
    category: { type: Sequelize.STRING(100), allowNull: true },
    normalBalance: { type: Sequelize.ENUM('debit','credit'), allowNull: false },
    parentId: { type: Sequelize.UUID, allowNull: true },
    balance: { type: Sequelize.DECIMAL(15,2), defaultValue: 0 },
    isControl: { type: Sequelize.BOOLEAN, defaultValue: false },
    isSystem: { type: Sequelize.BOOLEAN, defaultValue: false },
    description: { type: Sequelize.TEXT, allowNull: true },
    isActive: { type: Sequelize.BOOLEAN, defaultValue: true },
    createdAt: { type: Sequelize.DATE, allowNull: false },
    updatedAt: { type: Sequelize.DATE, allowNull: false },
    deletedAt: { type: Sequelize.DATE, allowNull: true },
  });

  // ─── Journal Entries ────────────────────────────────────────────
  await queryInterface.createTable('journal_entries', {
    id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
    organizationId: { type: Sequelize.UUID, allowNull: false },
    branchId: { type: Sequelize.UUID, allowNull: true },
    reference: { type: Sequelize.STRING(50), allowNull: false, unique: true },
    date: { type: Sequelize.DATEONLY, allowNull: false },
    description: { type: Sequelize.STRING(255), allowNull: false },
    module: { type: Sequelize.STRING(50), allowNull: true },
    sourceId: { type: Sequelize.UUID, allowNull: true },
    totalDebit: { type: Sequelize.DECIMAL(15,2), defaultValue: 0 },
    totalCredit: { type: Sequelize.DECIMAL(15,2), defaultValue: 0 },
    status: { type: Sequelize.ENUM('draft','posted','reversed'), defaultValue: 'posted' },
    postedBy: { type: Sequelize.UUID, allowNull: true },
    reversedAt: { type: Sequelize.DATE, allowNull: true },
    reversedBy: { type: Sequelize.UUID, allowNull: true },
    createdAt: { type: Sequelize.DATE, allowNull: false },
    updatedAt: { type: Sequelize.DATE, allowNull: false },
  });

  // ─── Journal Lines ──────────────────────────────────────────────
  await queryInterface.createTable('journal_lines', {
    id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
    journalEntryId: { type: Sequelize.UUID, allowNull: false, references: { model: 'journal_entries', key: 'id' } },
    accountId: { type: Sequelize.UUID, allowNull: false, references: { model: 'chart_of_accounts', key: 'id' } },
    organizationId: { type: Sequelize.UUID, allowNull: false },
    type: { type: Sequelize.ENUM('debit','credit'), allowNull: false },
    amount: { type: Sequelize.DECIMAL(15,2), allowNull: false },
    description: { type: Sequelize.STRING(255), allowNull: true },
    memberId: { type: Sequelize.UUID, allowNull: true },
  });

  // ─── Audit Logs ─────────────────────────────────────────────────
  await queryInterface.createTable('audit_logs', {
    id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
    userId: { type: Sequelize.UUID, allowNull: true },
    organizationId: { type: Sequelize.UUID, allowNull: true },
    action: { type: Sequelize.STRING(50), allowNull: false },
    module: { type: Sequelize.STRING(50), allowNull: false },
    description: { type: Sequelize.TEXT, allowNull: true },
    ipAddress: { type: Sequelize.STRING(45), allowNull: true },
    userAgent: { type: Sequelize.STRING(500), allowNull: true },
    metadata: { type: Sequelize.JSON, allowNull: true },
    statusCode: { type: Sequelize.INTEGER, allowNull: true },
    createdAt: { type: Sequelize.DATE, allowNull: false },
  });

  // ─── Notifications ──────────────────────────────────────────────
  await queryInterface.createTable('notifications', {
    id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
    organizationId: { type: Sequelize.UUID, allowNull: false },
    userId: { type: Sequelize.UUID, allowNull: true },
    memberId: { type: Sequelize.UUID, allowNull: true },
    type: { type: Sequelize.STRING(50), allowNull: false },
    title: { type: Sequelize.STRING(255), allowNull: false },
    message: { type: Sequelize.TEXT, allowNull: false },
    channel: { type: Sequelize.ENUM('in_app','email','sms'), defaultValue: 'in_app' },
    isRead: { type: Sequelize.BOOLEAN, defaultValue: false },
    readAt: { type: Sequelize.DATE, allowNull: true },
    metadata: { type: Sequelize.JSON, allowNull: true },
    createdAt: { type: Sequelize.DATE, allowNull: false },
    updatedAt: { type: Sequelize.DATE, allowNull: false },
  });

  // ─── M-Pesa Transactions ────────────────────────────────────────
  await queryInterface.createTable('mpesa_transactions', {
    id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
    organizationId: { type: Sequelize.UUID, allowNull: false },
    memberId: { type: Sequelize.UUID, allowNull: true },
    checkoutRequestId: { type: Sequelize.STRING(100), allowNull: true },
    merchantRequestId: { type: Sequelize.STRING(100), allowNull: true },
    phoneNumber: { type: Sequelize.STRING(20), allowNull: false },
    amount: { type: Sequelize.DECIMAL(15,2), allowNull: false },
    transactionType: { type: Sequelize.ENUM('stk_push','paybill','b2c'), defaultValue: 'stk_push' },
    status: { type: Sequelize.ENUM('pending','completed','failed','cancelled'), defaultValue: 'pending' },
    mpesaReceiptNumber: { type: Sequelize.STRING(50), allowNull: true },
    resultCode: { type: Sequelize.STRING(10), allowNull: true },
    resultDesc: { type: Sequelize.STRING(255), allowNull: true },
    callbackPayload: { type: Sequelize.JSON, allowNull: true },
    reconciledAt: { type: Sequelize.DATE, allowNull: true },
    reconciledBy: { type: Sequelize.UUID, allowNull: true },
    linkedTransactionId: { type: Sequelize.UUID, allowNull: true },
    createdAt: { type: Sequelize.DATE, allowNull: false },
    updatedAt: { type: Sequelize.DATE, allowNull: false },
  });

  // ─── Next of Kin ────────────────────────────────────────────────
  await queryInterface.createTable('next_of_kin', {
    id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
    memberId: { type: Sequelize.UUID, allowNull: false, references: { model: 'members', key: 'id' } },
    organizationId: { type: Sequelize.UUID, allowNull: false },
    firstName: { type: Sequelize.STRING(100), allowNull: false },
    lastName: { type: Sequelize.STRING(100), allowNull: false },
    relationship: { type: Sequelize.STRING(50), allowNull: false },
    phone: { type: Sequelize.STRING(20), allowNull: false },
    email: { type: Sequelize.STRING(150), allowNull: true },
    nationalId: { type: Sequelize.STRING(30), allowNull: true },
    address: { type: Sequelize.TEXT, allowNull: true },
    sharePercentage: { type: Sequelize.DECIMAL(5,2), defaultValue: 100 },
    isPrimary: { type: Sequelize.BOOLEAN, defaultValue: false },
    createdAt: { type: Sequelize.DATE, allowNull: false },
    updatedAt: { type: Sequelize.DATE, allowNull: false },
    deletedAt: { type: Sequelize.DATE, allowNull: true },
  });

  // ─── Member Documents ───────────────────────────────────────────
  await queryInterface.createTable('member_documents', {
    id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
    memberId: { type: Sequelize.UUID, allowNull: false, references: { model: 'members', key: 'id' } },
    organizationId: { type: Sequelize.UUID, allowNull: false },
    type: { type: Sequelize.ENUM('national_id','passport','kra_pin','payslip','utility_bill','bank_statement','other'), allowNull: false },
    fileName: { type: Sequelize.STRING(255), allowNull: false },
    filePath: { type: Sequelize.STRING(500), allowNull: false },
    mimeType: { type: Sequelize.STRING(100), allowNull: true },
    fileSize: { type: Sequelize.INTEGER, allowNull: true },
    uploadedBy: { type: Sequelize.UUID, allowNull: true },
    isVerified: { type: Sequelize.BOOLEAN, defaultValue: false },
    verifiedBy: { type: Sequelize.UUID, allowNull: true },
    verifiedAt: { type: Sequelize.DATE, allowNull: true },
    createdAt: { type: Sequelize.DATE, allowNull: false },
    updatedAt: { type: Sequelize.DATE, allowNull: false },
    deletedAt: { type: Sequelize.DATE, allowNull: true },
  });

  // Indexes
  await queryInterface.addIndex('chart_of_accounts', ['organizationId', 'code'], { unique: true });
  await queryInterface.addIndex('chart_of_accounts', ['organizationId', 'type']);
  await queryInterface.addIndex('journal_entries', ['organizationId']);
  await queryInterface.addIndex('journal_entries', ['date']);
  await queryInterface.addIndex('journal_lines', ['journalEntryId']);
  await queryInterface.addIndex('journal_lines', ['accountId']);
  await queryInterface.addIndex('audit_logs', ['userId']);
  await queryInterface.addIndex('audit_logs', ['organizationId']);
  await queryInterface.addIndex('audit_logs', ['action']);
  await queryInterface.addIndex('audit_logs', ['createdAt']);
  await queryInterface.addIndex('notifications', ['userId']);
  await queryInterface.addIndex('notifications', ['memberId']);
  await queryInterface.addIndex('notifications', ['isRead']);
  await queryInterface.addIndex('mpesa_transactions', ['checkoutRequestId']);
  await queryInterface.addIndex('mpesa_transactions', ['mpesaReceiptNumber']);
  await queryInterface.addIndex('mpesa_transactions', ['status']);
  await queryInterface.addIndex('next_of_kin', ['memberId']);
  await queryInterface.addIndex('member_documents', ['memberId']);
},

  down: async (queryInterface) => {
  const tables = [
    'member_documents', 'next_of_kin', 'mpesa_transactions',
    'notifications', 'audit_logs', 'journal_lines',
    'journal_entries', 'chart_of_accounts',
  ];
  for (const table of tables) {
    await queryInterface.dropTable(table);
  }
  }
};


