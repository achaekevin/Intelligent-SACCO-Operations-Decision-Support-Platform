const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const ORG_ID      = '11111111-1111-1111-1111-111111111111';
const BRANCH_HQ   = '22222222-2222-2222-2222-222222222222';
const BRANCH_KSM  = '33333333-3333-3333-3333-333333333333';
const ADMIN_ID    = '44444444-4444-4444-4444-444444444444';
const CASHIER_ID  = '55555555-5555-5555-5555-555555555555';
const MEMBER_ID   = '66666666-6666-6666-6666-666666666666';
const MEMBER2_ID  = '77777777-7777-7777-7777-777777777777';

const SAV_ACC_1   = '88888888-8888-8888-8888-888888888881';
const SAV_ACC_2   = '88888888-8888-8888-8888-888888888882';

const now = new Date();

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface) => {
  const ROUNDS = 10;

  // 1. Organization
  await queryInterface.bulkInsert('organizations', [{
    id: ORG_ID,
    name: 'Umoja Savings & Credit Co-operative',
    code: 'UMOJA001',
    email: 'admin@umojasacco.co.ke',
    phone: '+254712000001',
    address: 'Kimathi Street, Nairobi',
    registrationNumber: 'CS/006789',
    subscriptionPlan: 'professional',
    status: 'active',
    subscriptionExpiresAt: new Date('2025-12-31'),
    settings: JSON.stringify({
      currency: 'KES', timezone: 'Africa/Nairobi', interestMethod: 'reducing_balance',
      fiscalYearStart: '01-01', enableMpesa: true, enableSMS: false, loanApprovalLevels: 2,
    }),
    maxBranches: 10,
    maxMembers: 5000,
    createdAt: now, updatedAt: now,
  }]);

  // 2. Branches
  await queryInterface.bulkInsert('branches', [
    {
      id: BRANCH_HQ, organizationId: ORG_ID, name: 'Nairobi HQ', code: 'BR-001',
      email: 'nairobi@umojasacco.co.ke', phone: '+254712000002',
      address: 'Kimathi Street, Nairobi', county: 'Nairobi', town: 'Nairobi',
      isHeadquarters: true, status: 'active', createdAt: now, updatedAt: now,
    },
    {
      id: BRANCH_KSM, organizationId: ORG_ID, name: 'Kisumu Branch', code: 'BR-002',
      email: 'kisumu@umojasacco.co.ke', phone: '+254712000003',
      address: 'Oginga Odinga St, Kisumu', county: 'Kisumu', town: 'Kisumu',
      isHeadquarters: false, status: 'active', createdAt: now, updatedAt: now,
    },
  ]);

  // 3. Get role IDs from DB
  const [roles] = await queryInterface.sequelize.query(
    `SELECT id, slug FROM roles WHERE organizationId IS NULL AND isSystem = 1`
  );
  const roleMap = Object.fromEntries(roles.map((r) => [r.slug, r.id]));

  // 4. Users
  const adminHash  = await bcrypt.hash('Admin@1234', ROUNDS);
  const cashHash   = await bcrypt.hash('Cash@1234', ROUNDS);
  const memberHash = await bcrypt.hash('Member@1234', ROUNDS);

  await queryInterface.bulkInsert('users', [
    {
      id: ADMIN_ID, organizationId: ORG_ID, branchId: BRANCH_HQ,
      roleId: roleMap['sacco_admin'], role: 'sacco_admin',
      firstName: 'Grace', lastName: 'Wanjiru',
      email: 'admin@umojasacco.co.ke', phone: '+254712100001',
      password: adminHash, isEmailVerified: true, emailVerifiedAt: now,
      status: 'active', createdAt: now, updatedAt: now,
    },
    {
      id: CASHIER_ID, organizationId: ORG_ID, branchId: BRANCH_HQ,
      roleId: roleMap['cashier'], role: 'cashier',
      firstName: 'Brian', lastName: 'Otieno',
      email: 'cashier@umojasacco.co.ke', phone: '+254712100002',
      password: cashHash, isEmailVerified: true, emailVerifiedAt: now,
      status: 'active', createdAt: now, updatedAt: now,
    },
    {
      id: uuidv4(), organizationId: ORG_ID, branchId: BRANCH_HQ,
      roleId: roleMap['member'], role: 'member',
      firstName: 'John', lastName: 'Mwangi',
      email: 'member@umojasacco.co.ke', phone: '+254712100003',
      password: memberHash, isEmailVerified: true, emailVerifiedAt: now,
      memberId: MEMBER_ID, status: 'active', createdAt: now, updatedAt: now,
    },
  ]);

  // 5. Members
  await queryInterface.bulkInsert('members', [
    {
      id: MEMBER_ID, organizationId: ORG_ID, branchId: BRANCH_HQ,
      memberNumber: 'MBR-20240001', firstName: 'John', lastName: 'Mwangi',
      phone: '+254712100003', email: 'member@umojasacco.co.ke',
      nationalId: '30123456', gender: 'male', occupation: 'Teacher',
      county: 'Nairobi', town: 'Nairobi', joiningDate: '2024-01-15',
      status: 'active', activatedAt: now, loyaltyTier: 'silver', loyaltyPoints: 150,
      createdAt: now, updatedAt: now,
    },
    {
      id: MEMBER2_ID, organizationId: ORG_ID, branchId: BRANCH_KSM,
      memberNumber: 'MBR-20240002', firstName: 'Faith', lastName: 'Chebet',
      phone: '+254712100004', email: 'faith@email.com',
      nationalId: '32654789', gender: 'female', occupation: 'Business',
      county: 'Kisumu', town: 'Kisumu', joiningDate: '2024-02-01',
      status: 'active', activatedAt: now, loyaltyTier: 'bronze', loyaltyPoints: 30,
      createdAt: now, updatedAt: now,
    },
  ]);

  // 6. Savings accounts
  await queryInterface.bulkInsert('savings_accounts', [
    {
      id: SAV_ACC_1, organizationId: ORG_ID, branchId: BRANCH_HQ,
      memberId: MEMBER_ID, accountNumber: 'SAV-1704000001',
      accountType: 'ordinary', balance: 45000.00, availableBalance: 45000.00,
      interestRate: 6.00, minimumBalance: 0, status: 'active',
      lastTransactionAt: now, createdAt: now, updatedAt: now,
    },
    {
      id: uuidv4(), organizationId: ORG_ID, branchId: BRANCH_HQ,
      memberId: MEMBER_ID, accountNumber: 'SHR-1704000001',
      accountType: 'share_capital', balance: 12000.00, availableBalance: 12000.00,
      interestRate: 0, minimumBalance: 500, status: 'active',
      lastTransactionAt: now, createdAt: now, updatedAt: now,
    },
    {
      id: SAV_ACC_2, organizationId: ORG_ID, branchId: BRANCH_KSM,
      memberId: MEMBER2_ID, accountNumber: 'SAV-1704000002',
      accountType: 'ordinary', balance: 8500.00, availableBalance: 8500.00,
      interestRate: 6.00, minimumBalance: 0, status: 'active',
      lastTransactionAt: now, createdAt: now, updatedAt: now,
    },
  ]);
},

  down: async (queryInterface) => {
  await queryInterface.bulkDelete('savings_accounts', { organizationId: ORG_ID }, {});
  await queryInterface.bulkDelete('members', { organizationId: ORG_ID }, {});
  await queryInterface.bulkDelete('users', { organizationId: ORG_ID }, {});
  await queryInterface.bulkDelete('branches', { organizationId: ORG_ID }, {});
  await queryInterface.bulkDelete('organizations', { id: ORG_ID }, {});
    }
};