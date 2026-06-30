const { v4: uuidv4 } = require('uuid');

const ORG_ID = '11111111-1111-1111-1111-111111111111';
const now = new Date();

const LOAN_PRODUCTS = [
  {
    name: 'Emergency Loan', code: 'EM', type: 'emergency',
    interestRate: 10, interestMethod: 'reducing_balance',
    minAmount: 5000, maxAmount: 200000, minTermMonths: 1, maxTermMonths: 12,
    processingFeePercent: 1, insuranceFeePercent: 0.5, penaltyRate: 2,
    gracePeriodDays: 0, requiresGuarantor: false, minGuarantors: 0, multiplierOfSavings: 2,
  },
  {
    name: 'Development Loan', code: 'DV', type: 'development',
    interestRate: 12, interestMethod: 'reducing_balance',
    minAmount: 50000, maxAmount: 2000000, minTermMonths: 6, maxTermMonths: 48,
    processingFeePercent: 2, insuranceFeePercent: 1, penaltyRate: 3,
    gracePeriodDays: 30, requiresGuarantor: true, minGuarantors: 2, multiplierOfSavings: 3,
  },
  {
    name: 'School Fees Loan', code: 'SF', type: 'school_fees',
    interestRate: 8, interestMethod: 'reducing_balance',
    minAmount: 10000, maxAmount: 500000, minTermMonths: 3, maxTermMonths: 24,
    processingFeePercent: 1, insuranceFeePercent: 0, penaltyRate: 2,
    gracePeriodDays: 7, requiresGuarantor: true, minGuarantors: 1, multiplierOfSavings: 3,
  },
  {
    name: 'Business Loan', code: 'BZ', type: 'business',
    interestRate: 14, interestMethod: 'reducing_balance',
    minAmount: 100000, maxAmount: 3000000, minTermMonths: 12, maxTermMonths: 60,
    processingFeePercent: 2.5, insuranceFeePercent: 1, penaltyRate: 3,
    gracePeriodDays: 30, requiresGuarantor: true, minGuarantors: 2, multiplierOfSavings: 4,
  },
  {
    name: 'Asset Financing', code: 'AF', type: 'asset_financing',
    interestRate: 16, interestMethod: 'flat',
    minAmount: 200000, maxAmount: 5000000, minTermMonths: 12, maxTermMonths: 72,
    processingFeePercent: 3, insuranceFeePercent: 2, penaltyRate: 5,
    gracePeriodDays: 30, requiresGuarantor: true, minGuarantors: 3, multiplierOfSavings: 5,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface) => {
  await queryInterface.bulkInsert('loan_products', LOAN_PRODUCTS.map((p) => ({
    id: uuidv4(),
    organizationId: ORG_ID,
    ...p,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  })));
},

  down: async (queryInterface) => {
  await queryInterface.bulkDelete('loan_products', { organizationId: ORG_ID }, {});
    }
};