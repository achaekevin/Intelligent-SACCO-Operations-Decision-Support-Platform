// Analytics Center Service
export class AnalyticsService {
  static getAnalyticsOverview() {
    return {
      topLoanProducts: [
        { name: 'Business Enterprise Boost Loan', totalDisbursedKES: 68000000, activeCount: 215, defaultRate: '0.8%' },
        { name: 'Development Super Loan', totalDisbursedKES: 45000000, activeCount: 180, defaultRate: '1.2%' },
        { name: 'Flexi Education Loan', totalDisbursedKES: 18500000, activeCount: 140, defaultRate: '0.4%' },
        { name: 'Emergency Instant Loan', totalDisbursedKES: 11000000, activeCount: 310, defaultRate: '2.1%' },
      ],
      fastestGrowingBranches: [
        { name: 'Nairobi Central Branch', memberGrowthPct: '+24.5%', newLoansCount: 185, netSavingsDepositKES: 18500000 },
        { name: 'Eldoret Rift Branch', memberGrowthPct: '+18.2%', newLoansCount: 120, netSavingsDepositKES: 12400000 },
        { name: 'Mombasa Coastal Branch', memberGrowthPct: '+14.0%', newLoansCount: 95, netSavingsDepositKES: 9800000 },
        { name: 'Kisumu Western Branch', memberGrowthPct: '+11.8%', newLoansCount: 78, netSavingsDepositKES: 7200000 },
      ],
      mostActiveMembers: [
        { name: 'John Kamau', memberNo: 'MEM-00124', totalTransactionsCount: 48, totalSavingsKES: 450000, loyaltyTier: 'PLATINUM' },
        { name: 'Jane Mutua', memberNo: 'MEM-00202', totalTransactionsCount: 42, totalSavingsKES: 380000, loyaltyTier: 'GOLD' },
        { name: 'Peter Njuguna', memberNo: 'MEM-00108', totalTransactionsCount: 39, totalSavingsKES: 620000, loyaltyTier: 'PLATINUM' },
        { name: 'Grace Wambui', memberNo: 'MEM-00302', totalTransactionsCount: 35, totalSavingsKES: 310000, loyaltyTier: 'GOLD' },
      ],
      mostProfitableCategories: [
        { category: 'Business Loans', grossInterestKES: 8400000, margin: '68%' },
        { category: 'Development Loans', grossInterestKES: 5800000, margin: '62%' },
        { category: 'Emergency Loans', grossInterestKES: 2100000, margin: '74%' },
        { category: 'Education Loans', grossInterestKES: 1650000, margin: '55%' },
      ],
      membersAtRiskCount: 18,
      monthlyTrends: [
        { month: 'Jan', loanDisbursements: 12000000, savingsDeposits: 15000000, repayments: 11000000 },
        { month: 'Feb', loanDisbursements: 14000000, savingsDeposits: 16500000, repayments: 12500000 },
        { month: 'Mar', loanDisbursements: 13500000, savingsDeposits: 18000000, repayments: 13000000 },
        { month: 'Apr', loanDisbursements: 16000000, savingsDeposits: 19500000, repayments: 14200000 },
        { month: 'May', loanDisbursements: 17500000, savingsDeposits: 21000000, repayments: 15500000 },
        { month: 'Jun', loanDisbursements: 19000000, savingsDeposits: 22500000, repayments: 16800000 },
        { month: 'Jul', loanDisbursements: 21000000, savingsDeposits: 24000000, repayments: 18200000 },
      ],
      annualComparison: {
        year2025TotalAssets: 185000000,
        year2026YtdAssets: 232000000,
        growthPercentage: 25.4,
      },
    };
  }
}

export default AnalyticsService;
