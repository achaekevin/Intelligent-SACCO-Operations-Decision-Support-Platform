// Financial Health & Key Metrics Service
export class FinancialHealthService {
  static getFinancialHealthOverview() {
    return {
      portfolioAtRisk: {
        par30: 2.8, // 2.8%
        par60: 1.4,
        par90: 0.9,
        totalDefaultRate: 0.4,
        portfolioQualityScore: 'EXCELLENT', // EXCELLENT (A+), GOOD (B), FAIR (C), RISK (D)
      },
      loanRecoveryRate: 98.4, // %
      savingsGrowthRate: 14.2, // % YoY
      liquidityRatio: 28.5, // Statutory min is 20%
      memberRetentionRate: 96.8, // %
      totalLoanPortfolioKES: 142500000,
      totalSavingsDepositsKES: 185000000,
      totalShareCapitalKES: 45000000,
      branchPerformance: [
        { name: 'Nairobi Central Branch', activeLoans: 450, totalSavings: 68000000, recoveryRate: 99.1, status: 'TOP_PERFORMER' },
        { name: 'Mombasa Coastal Branch', activeLoans: 280, totalSavings: 42000000, recoveryRate: 97.8, status: 'STABLE' },
        { name: 'Eldoret Rift Branch', activeLoans: 310, totalSavings: 48000000, recoveryRate: 98.2, status: 'HIGH_GROWTH' },
        { name: 'Kisumu Western Branch', activeLoans: 190, totalSavings: 27000000, recoveryRate: 96.5, status: 'STABLE' },
      ],
      revenueTrends: [
        { month: 'Jan', interestIncome: 4200000, feeIncome: 650000, expenses: 1800000, netProfit: 3050000 },
        { month: 'Feb', interestIncome: 4500000, feeIncome: 700000, expenses: 1900000, netProfit: 3300000 },
        { month: 'Mar', interestIncome: 4800000, feeIncome: 720000, expenses: 1950000, netProfit: 3570000 },
        { month: 'Apr', interestIncome: 5100000, feeIncome: 800000, expenses: 2000000, netProfit: 3900000 },
        { month: 'May', interestIncome: 5300000, feeIncome: 850000, expenses: 2050000, netProfit: 4100000 },
        { month: 'Jun', interestIncome: 5600000, feeIncome: 890000, expenses: 2100000, netProfit: 4390000 },
        { month: 'Jul', interestIncome: 6000000, feeIncome: 950000, expenses: 2150000, netProfit: 4800000 },
      ],
      healthChecklist: [
        { indicator: 'Liquidity Ratio', value: '28.5%', target: '>= 20%', status: 'HEALTHY' },
        { indicator: 'PAR > 30 Days', value: '2.8%', target: '< 5.0%', status: 'HEALTHY' },
        { indicator: 'Capital Adequacy', value: '18.4%', target: '>= 10%', status: 'HEALTHY' },
        { indicator: 'Loan-to-Deposit Ratio', value: '77.0%', target: '70% - 80%', status: 'OPTIMAL' },
      ],
    };
  }
}

export default FinancialHealthService;
