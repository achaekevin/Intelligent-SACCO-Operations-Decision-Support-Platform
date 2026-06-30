const { v4: uuidv4 } = require('uuid');

const ROLES = [
  { id: uuidv4(), name: 'SACCO Admin',     slug: 'sacco_admin',     description: 'Full access within SACCO',         isSystem: true },
  { id: uuidv4(), name: 'Loan Officer',    slug: 'loan_officer',    description: 'Manage loan applications',          isSystem: true },
  { id: uuidv4(), name: 'Cashier',         slug: 'cashier',         description: 'Process deposits and withdrawals',  isSystem: true },
  { id: uuidv4(), name: 'Auditor',         slug: 'auditor',         description: 'Read-only audit access',            isSystem: true },
  { id: uuidv4(), name: 'Member',          slug: 'member',          description: 'Member self-service portal',        isSystem: true },
];

const PERMISSIONS = [
  // Members
  { id: uuidv4(), name: 'member:create', module: 'member', description: 'Register new members' },
  { id: uuidv4(), name: 'member:read',   module: 'member', description: 'View member details' },
  { id: uuidv4(), name: 'member:update', module: 'member', description: 'Update member details' },
  { id: uuidv4(), name: 'member:delete', module: 'member', description: 'Remove members' },
  // Savings
  { id: uuidv4(), name: 'savings:deposit',  module: 'savings', description: 'Process deposits' },
  { id: uuidv4(), name: 'savings:withdraw', module: 'savings', description: 'Process withdrawals' },
  { id: uuidv4(), name: 'savings:read',     module: 'savings', description: 'View savings accounts' },
  // Loans
  { id: uuidv4(), name: 'loan:apply',    module: 'loan', description: 'Submit loan applications' },
  { id: uuidv4(), name: 'loan:approve',  module: 'loan', description: 'Approve / reject loans' },
  { id: uuidv4(), name: 'loan:disburse', module: 'loan', description: 'Disburse approved loans' },
  { id: uuidv4(), name: 'loan:read',     module: 'loan', description: 'View loan records' },
  // Reports
  { id: uuidv4(), name: 'report:read',   module: 'report', description: 'Generate and view reports' },
  { id: uuidv4(), name: 'report:export', module: 'report', description: 'Export reports' },
  // Accounting
  { id: uuidv4(), name: 'accounting:read',  module: 'accounting', description: 'View accounting records' },
  { id: uuidv4(), name: 'accounting:write', module: 'accounting', description: 'Create journal entries' },
  // Admin
  { id: uuidv4(), name: 'settings:manage', module: 'settings', description: 'Manage system settings' },
  { id: uuidv4(), name: 'user:manage',     module: 'user',     description: 'Manage staff users' },
  { id: uuidv4(), name: 'branch:manage',   module: 'branch',   description: 'Manage branches' },
  { id: uuidv4(), name: 'audit:read',      module: 'audit',    description: 'View audit logs' },
];

const now = new Date();
const timestamps = { createdAt: now, updatedAt: now };

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface) => {
  // Seed roles (null organizationId = system-level)
  await queryInterface.bulkInsert('roles', ROLES.map((r) => ({
    ...r, organizationId: null, ...timestamps,
  })));

  // Seed permissions
  await queryInterface.bulkInsert('permissions', PERMISSIONS.map((p) => ({ ...p, ...timestamps })));
},

  down: async (queryInterface) => {
  await queryInterface.bulkDelete('permissions', null, {});
  await queryInterface.bulkDelete('roles', null, {});
    }
};