// Dynamic Product Builder Service
export class ProductBuilderService {
  static products = [
    {
      id: 'prod_savings_01',
      code: 'SAV_HOLIDAY',
      name: 'Holiday & Festival Savings Account',
      type: 'SAVINGS',
      interestRate: 8.0, // % per annum
      minDeposit: 500, // KES
      withdrawalLockMonths: 12,
      interestCalculationMethod: 'DAILY_COMPOUNDED',
      status: 'ACTIVE',
      description: 'Dedicated savings plan for holiday season with fixed 12-month lock and attractive 8% annual return.',
      createdAt: '2026-01-10',
    },
    {
      id: 'prod_savings_02',
      code: 'SAV_JUNIOR',
      name: 'Junior Education Savings Plan',
      type: 'SAVINGS',
      interestRate: 9.5,
      minDeposit: 1000,
      withdrawalLockMonths: 24,
      interestCalculationMethod: 'SIMPLE_ANNUAL',
      status: 'ACTIVE',
      description: 'High-yield long term savings account for children school fees with bonus annual dividend.',
      createdAt: '2026-01-15',
    },
    {
      id: 'prod_loan_01',
      code: 'LN_EDU_FLEX',
      name: 'Flexi Education Loan',
      type: 'LOAN',
      interestRate: 9.0, // % per annum
      maxAmount: 600000, // KES
      gracePeriodMonths: 6,
      maxRepaymentMonths: 36,
      requireGuarantors: true,
      minGuarantorsCount: 2,
      savingsMultiplier: 4,
      status: 'ACTIVE',
      description: 'Low-interest education loan with 6 months grace period prior to principal repayment.',
      createdAt: '2026-02-01',
    },
    {
      id: 'prod_loan_02',
      code: 'LN_BIZ_BOOST',
      name: 'Business Enterprise Boost Loan',
      type: 'LOAN',
      interestRate: 11.5,
      maxAmount: 3000000,
      gracePeriodMonths: 3,
      maxRepaymentMonths: 48,
      requireGuarantors: true,
      minGuarantorsCount: 3,
      savingsMultiplier: 3,
      status: 'ACTIVE',
      description: 'Capital expansion loan for SACCO business members with flexible collateral options.',
      createdAt: '2026-03-12',
    },
  ];

  static getProducts(typeFilter = null) {
    if (typeFilter && typeFilter !== 'ALL') {
      return this.products.filter((p) => p.type === typeFilter);
    }
    return this.products;
  }

  static createProduct(productData) {
    const code = productData.code || `${productData.type}_${Date.now().toString().slice(-4)}`;
    const newProduct = {
      id: `prod_${Date.now()}`,
      code,
      status: 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0],
      ...productData,
    };

    this.products.push(newProduct);
    return newProduct;
  }

  static updateProduct(id, updated) {
    const idx = this.products.findIndex((p) => p.id === id);
    if (idx !== -1) {
      this.products[idx] = { ...this.products[idx], ...updated };
      return this.products[idx];
    }
    return null;
  }

  static toggleProductStatus(id) {
    const p = this.products.find((item) => item.id === id);
    if (p) {
      p.status = p.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      return p;
    }
    return null;
  }
}

export default ProductBuilderService;
