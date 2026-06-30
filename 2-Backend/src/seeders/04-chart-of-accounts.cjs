const { v4: uuidv4 } = require('uuid');

const ORG_ID = '11111111-1111-1111-1111-111111111111';
const now = new Date();

const ACCOUNTS = [
  // ─── Assets ──────────────────────────────────────────────────────
  { code: '1000', name: 'Current Assets',        type: 'asset',   normalBalance: 'debit',  category: 'current_assets',    isControl: true },
  { code: '1010', name: 'Cash on Hand',          type: 'asset',   normalBalance: 'debit',  category: 'current_assets',    isControl: false },
  { code: '1020', name: 'Bank Account - KCB',    type: 'asset',   normalBalance: 'debit',  category: 'current_assets',    isControl: false },
  { code: '1030', name: 'M-Pesa Float',          type: 'asset',   normalBalance: 'debit',  category: 'current_assets',    isControl: false },
  { code: '1100', name: 'Member Loans (Net)',     type: 'asset',   normalBalance: 'debit',  category: 'loans_receivable',  isControl: true },
  { code: '1110', name: 'Loans Disbursed',        type: 'asset',   normalBalance: 'debit',  category: 'loans_receivable',  isControl: false },
  { code: '1120', name: 'Interest Receivable',   type: 'asset',   normalBalance: 'debit',  category: 'loans_receivable',  isControl: false },
  { code: '1200', name: 'Fixed Assets',          type: 'asset',   normalBalance: 'debit',  category: 'fixed_assets',      isControl: true },
  { code: '1210', name: 'Furniture & Equipment', type: 'asset',   normalBalance: 'debit',  category: 'fixed_assets',      isControl: false },
  // ─── Liabilities ─────────────────────────────────────────────────
  { code: '2000', name: 'Current Liabilities',   type: 'liability', normalBalance: 'credit', category: 'current_liabilities', isControl: true },
  { code: '2010', name: 'Member Deposits',        type: 'liability', normalBalance: 'credit', category: 'member_savings',      isControl: true },
  { code: '2011', name: 'Ordinary Savings',       type: 'liability', normalBalance: 'credit', category: 'member_savings',      isControl: false },
  { code: '2012', name: 'Share Capital',          type: 'liability', normalBalance: 'credit', category: 'member_savings',      isControl: false },
  { code: '2013', name: 'Fixed Deposits',         type: 'liability', normalBalance: 'credit', category: 'member_savings',      isControl: false },
  { code: '2100', name: 'External Borrowings',   type: 'liability', normalBalance: 'credit', category: 'borrowings',          isControl: false },
  // ─── Equity ──────────────────────────────────────────────────────
  { code: '3000', name: 'Equity',                type: 'equity',  normalBalance: 'credit', category: 'equity',              isControl: true },
  { code: '3010', name: 'Retained Earnings',     type: 'equity',  normalBalance: 'credit', category: 'equity',              isControl: false },
  { code: '3020', name: 'General Reserve',       type: 'equity',  normalBalance: 'credit', category: 'equity',              isControl: false },
  // ─── Income ──────────────────────────────────────────────────────
  { code: '4000', name: 'Income',                type: 'income',  normalBalance: 'credit', category: 'income',              isControl: true },
  { code: '4010', name: 'Interest Income',       type: 'income',  normalBalance: 'credit', category: 'interest_income',     isControl: false },
  { code: '4020', name: 'Loan Processing Fees',  type: 'income',  normalBalance: 'credit', category: 'fee_income',          isControl: false },
  { code: '4030', name: 'Insurance Fees',        type: 'income',  normalBalance: 'credit', category: 'fee_income',          isControl: false },
  { code: '4040', name: 'Penalty Income',        type: 'income',  normalBalance: 'credit', category: 'penalty_income',      isControl: false },
  { code: '4050', name: 'Investment Income',     type: 'income',  normalBalance: 'credit', category: 'other_income',        isControl: false },
  // ─── Expenses ────────────────────────────────────────────────────
  { code: '5000', name: 'Expenses',              type: 'expense', normalBalance: 'debit',  category: 'expenses',            isControl: true },
  { code: '5010', name: 'Staff Salaries',        type: 'expense', normalBalance: 'debit',  category: 'personnel_costs',     isControl: false },
  { code: '5020', name: 'Rent & Utilities',      type: 'expense', normalBalance: 'debit',  category: 'operating_expenses',  isControl: false },
  { code: '5030', name: 'Interest on Deposits',  type: 'expense', normalBalance: 'debit',  category: 'finance_costs',       isControl: false },
  { code: '5040', name: 'Bank Charges',          type: 'expense', normalBalance: 'debit',  category: 'finance_costs',       isControl: false },
  { code: '5050', name: 'Depreciation',          type: 'expense', normalBalance: 'debit',  category: 'non_cash_expenses',   isControl: false },
  { code: '5060', name: 'IT & Systems',          type: 'expense', normalBalance: 'debit',  category: 'operating_expenses',  isControl: false },
  { code: '5070', name: 'Marketing',             type: 'expense', normalBalance: 'debit',  category: 'operating_expenses',  isControl: false },
  { code: '5080', name: 'Loan Loss Provision',   type: 'expense', normalBalance: 'debit',  category: 'provisions',          isControl: false },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface) => {
  await queryInterface.bulkInsert('chart_of_accounts', ACCOUNTS.map((a) => ({
    id: uuidv4(),
    organizationId: ORG_ID,
    ...a,
    balance: 0,
    isSystem: false,
    isActive: true,
    description: null,
    parentId: null,
    createdAt: now,
    updatedAt: now,
  })));
},

  down: async (queryInterface) => {
  await queryInterface.bulkDelete('chart_of_accounts', { organizationId: ORG_ID }, {});
    }
};