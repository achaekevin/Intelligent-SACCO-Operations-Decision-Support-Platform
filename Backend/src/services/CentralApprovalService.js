// Central Approval Center Service
export class CentralApprovalService {
  static pendingApprovals = [
    {
      id: 'appr_01',
      category: 'LOANS',
      referenceNo: 'LN-2026-0891',
      title: 'Business Loan Application - KES 450,000',
      applicantName: 'John Kamau (MEM-00124)',
      branch: 'Nairobi Central Branch',
      requestedAmount: 450000,
      currentStep: 'Credit Committee Approval',
      submittedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      priority: 'HIGH',
      details: {
        savings: 180000,
        guarantorsCount: 3,
        eligibilityScore: '92%',
        dti: '32%',
      },
    },
    {
      id: 'appr_02',
      category: 'MEMBERSHIPS',
      referenceNo: 'MBR-2026-0142',
      title: 'New Member Onboarding - Corporate Tier',
      applicantName: 'Sarah Cherono',
      branch: 'Eldoret Rift Branch',
      requestedAmount: 0,
      currentStep: 'Branch Manager Approval',
      submittedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
      priority: 'NORMAL',
      details: {
        employer: 'KPLC Corporate',
        shareCapitalPledged: 50000,
        kycStatus: 'Verified (National ID & KRA PIN)',
      },
    },
    {
      id: 'appr_03',
      category: 'WITHDRAWALS',
      referenceNo: 'WTH-2026-0084',
      title: 'Savings Account Partial Withdrawal - KES 250,000',
      applicantName: 'David Kiprop (MEM-00215)',
      branch: 'Mombasa Coastal Branch',
      requestedAmount: 250000,
      currentStep: 'Accountant Authorization',
      submittedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      priority: 'HIGH',
      details: {
        savingsBalance: 950000,
        withdrawalReason: 'Medical Emergency',
        signatoriesVerified: true,
      },
    },
    {
      id: 'appr_04',
      category: 'EXPENSES',
      referenceNo: 'EXP-2026-0022',
      title: 'Branch Server Maintenance Voucher - KES 85,000',
      applicantName: 'IT Operations Department',
      branch: 'Nairobi Central Branch',
      requestedAmount: 850000,
      currentStep: 'CEO Expenditure Approval',
      submittedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
      priority: 'NORMAL',
      details: {
        vendor: 'TechSec Solutions Ltd',
        budgetCategory: 'IT Infrastructure',
        quotationVerified: true,
      },
    },
    {
      id: 'appr_05',
      category: 'BRANCH_REQUESTS',
      referenceNo: 'BR-2026-0005',
      title: 'Branch Vault Cash Limit Increase - KES 5,000,000',
      applicantName: 'Branch Manager (Eldoret)',
      branch: 'Eldoret Rift Branch',
      requestedAmount: 5000000,
      currentStep: 'Head of Operations Approval',
      submittedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      priority: 'HIGH',
      details: {
        currentLimit: 10000000,
        proposedLimit: 15000000,
        reason: 'End-of-month dividend payout cash handling',
      },
    },
  ];

  static getPendingApprovals(categoryFilter = null) {
    if (categoryFilter && categoryFilter !== 'ALL') {
      return this.pendingApprovals.filter((a) => a.category === categoryFilter);
    }
    return this.pendingApprovals;
  }

  static processAction(approvalId, action, notes, user) {
    const idx = this.pendingApprovals.findIndex((a) => a.id === approvalId);
    if (idx !== -1) {
      const item = this.pendingApprovals[idx];
      this.pendingApprovals.splice(idx, 1);
      return {
        processed: true,
        item,
        action, // APPROVED, REJECTED, ESCALATED
        processedBy: user || 'Current User',
        processedAt: new Date().toISOString(),
        notes,
      };
    }
    throw new Error('Approval item not found');
  }

  static processBatch(approvalIds, action, notes, user) {
    const results = [];
    for (const id of approvalIds) {
      try {
        const res = this.processAction(id, action, notes, user);
        results.push(res);
      } catch (err) {
        // Continue batch
      }
    }
    return results;
  }
}

export default CentralApprovalService;
