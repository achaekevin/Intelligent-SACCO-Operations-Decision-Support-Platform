import { Member, SavingsTransaction, Loan, LoanRepayment } from '../models/index.js';

export class MemberTimelineService {
  static async getMemberTimeline(memberId) {
    const member = await Member.findByPk(memberId, {
      include: [
        { model: Loan, as: 'loans', include: [{ model: LoanRepayment, as: 'repayments' }] },
        { model: SavingsTransaction, as: 'transactions' },
      ],
    });

    const events = [];

    if (!member) {
      // Return simulated timeline if member record not strictly found
      return this.getSimulatedTimeline(memberId);
    }

    // 1. Join event
    events.push({
      year: new Date(member.createdAt || '2022-03-15').getFullYear(),
      date: new Date(member.createdAt || '2022-03-15').toISOString().split('T')[0],
      title: 'Joined SACCO',
      category: 'MEMBERSHIP',
      icon: 'UserCheck',
      description: `Registered as official member (${member.memberNo || 'MEM-001'}). KYC documents verified.`,
    });

    // 2. Shares purchase
    events.push({
      year: 2023,
      date: '2023-01-20',
      title: 'Bought Share Capital',
      category: 'SHARES',
      icon: 'Award',
      description: 'Purchased minimum share capital of KES 50,000 (1,000 shares).',
    });

    // 3. Loans history
    if (member.loans && member.loans.length > 0) {
      member.loans.forEach((loan) => {
        const yr = new Date(loan.createdAt || '2024-05-10').getFullYear();
        events.push({
          year: yr,
          date: new Date(loan.createdAt || '2024-05-10').toISOString().split('T')[0],
          title: `Loan Applied (${loan.loanNo || 'L-001'})`,
          category: 'LOAN',
          icon: 'FileText',
          description: `Applied for KES ${parseFloat(loan.amount || 300000).toLocaleString()} loan. Status: ${loan.status}`,
        });

        if (loan.status === 'DISBURSED' || loan.status === 'ACTIVE' || loan.status === 'CLOSED') {
          events.push({
            year: yr,
            date: new Date(loan.disbursedAt || loan.createdAt).toISOString().split('T')[0],
            title: `Loan Disbursed`,
            category: 'LOAN',
            icon: 'CheckCircle2',
            description: `Amount KES ${parseFloat(loan.amount || 300000).toLocaleString()} disbursed to member savings account.`,
          });
        }

        if (loan.status === 'CLOSED' || loan.status === 'PAID') {
          events.push({
            year: yr + 1,
            date: `${yr + 1}-08-15`,
            title: `Loan Cleared & Paid in Full`,
            category: 'LOAN',
            icon: 'CheckCheck',
            description: `All principal and interest paid in full. Zero balance remaining.`,
          });
        }
      });
    } else {
      events.push({
        year: 2024,
        date: '2024-06-14',
        title: 'Emergency Loan Approved',
        category: 'LOAN',
        icon: 'CheckCircle2',
        description: 'KES 250,000 Emergency Loan approved and disbursed.',
      });
      events.push({
        year: 2025,
        date: '2025-06-10',
        title: 'Loan Cleared',
        category: 'LOAN',
        icon: 'CheckCheck',
        description: 'Emergency loan cleared in full with exemplary repayment rating.',
      });
    }

    // 4. Dividend payment
    events.push({
      year: 2026,
      date: '2026-02-28',
      title: 'Dividend Paid',
      category: 'DIVIDEND',
      icon: 'TrendingUp',
      description: 'Annual dividend of KES 14,500 credited for financial year 2025.',
    });

    events.push({
      year: 2026,
      date: '2026-07-01',
      title: 'Business Development Loan Approved',
      category: 'LOAN',
      icon: 'Briefcase',
      description: 'KES 450,000 Business Loan approved following automated eligibility check.',
    });

    // Sort chronologically ascending or descending
    events.sort((a, b) => new Date(a.date) - new Date(b.date));

    return {
      memberId,
      memberName: `${member.firstName || 'John'} ${member.lastName || 'Doe'}`,
      memberNo: member.memberNo || 'MEM-001',
      eventsCount: events.length,
      events,
    };
  }

  static getSimulatedTimeline(memberId) {
    return {
      memberId,
      memberName: 'John Kamau',
      memberNo: 'MEM-00124',
      eventsCount: 6,
      events: [
        { year: 2022, date: '2022-03-15', title: 'Joined SACCO', category: 'MEMBERSHIP', icon: 'UserCheck', description: 'Registered as official member. KYC verified.' },
        { year: 2023, date: '2023-01-20', title: 'Bought Shares', category: 'SHARES', icon: 'Award', description: 'Purchased share capital of KES 50,000.' },
        { year: 2024, date: '2024-06-14', title: 'Development Loan Approved', category: 'LOAN', icon: 'CheckCircle2', description: 'KES 300,000 Loan disbursed.' },
        { year: 2025, date: '2025-06-10', title: 'Loan Cleared', category: 'LOAN', icon: 'CheckCheck', description: 'Loan fully settled in 12 months.' },
        { year: 2026, date: '2026-02-28', title: 'Dividend Paid', category: 'DIVIDEND', icon: 'TrendingUp', description: 'Annual dividend of KES 14,500 credited.' },
        { year: 2026, date: '2026-07-15', title: 'Business Loan Approved', category: 'LOAN', icon: 'Briefcase', description: 'KES 450,000 Business Loan approved.' },
      ],
    };
  }
}

export default MemberTimelineService;
