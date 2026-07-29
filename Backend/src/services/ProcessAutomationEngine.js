// Process Automation Engine
export class ProcessAutomationEngine {
  static automationJobs = [
    {
      id: 'job_monthly_interest',
      name: 'Monthly Savings Interest Posting',
      frequency: 'MONTHLY_END',
      lastRun: '2026-06-30 23:59:00',
      nextRun: '2026-07-31 23:59:00',
      status: 'SCHEDULED',
      description: 'Calculates and posts monthly compounded interest for all active savings accounts.',
      lastRunStats: { accountsProcessed: 1420, totalInterestPaidKES: 1240500 },
    },
    {
      id: 'job_late_penalties',
      name: 'Automated Loan Default Penalty Application',
      frequency: 'DAILY_01AM',
      lastRun: '2026-07-28 01:00:00',
      nextRun: '2026-07-29 01:00:00',
      status: 'SCHEDULED',
      description: 'Scans overdue installments (>5 days past due) and applies 2.5% statutory penalty fee.',
      lastRunStats: { loansPenalized: 14, totalPenaltiesKES: 45200 },
    },
    {
      id: 'job_due_reminders',
      name: 'SMS & Email Due Date Reminders Dispatcher',
      frequency: 'DAILY_08AM',
      lastRun: '2026-07-28 08:00:00',
      nextRun: '2026-07-29 08:00:00',
      status: 'SCHEDULED',
      description: 'Dispatches automated reminder notices for loans due within 7 days and 3 days.',
      lastRunStats: { smsSent: 86, emailsSent: 86 },
    },
    {
      id: 'job_dormant_archival',
      name: 'Inactive Account Dormancy Auto-Archival',
      frequency: 'MONTHLY_1ST',
      lastRun: '2026-07-01 00:00:00',
      nextRun: '2026-08-01 00:00:00',
      status: 'SCHEDULED',
      description: 'Transitions accounts with zero activity > 365 days to Dormant status.',
      lastRunStats: { accountsArchived: 8 },
    },
    {
      id: 'job_completed_loan_close',
      name: 'Completed Loan Auto-Closure Processor',
      frequency: 'HOURLY',
      lastRun: '2026-07-28 14:00:00',
      nextRun: '2026-07-28 15:00:00',
      status: 'SCHEDULED',
      description: 'Verifies loans with 0 balance and transitions status to PAID_FULL and releases guarantor pledges.',
      lastRunStats: { loansClosed: 3 },
    },
    {
      id: 'job_dividend_report',
      name: 'Annual Dividend Calculation & Payout Report Engine',
      frequency: 'YEARLY_DEC',
      lastRun: '2025-12-31 23:59:00',
      nextRun: '2026-12-31 23:59:00',
      status: 'SCHEDULED',
      description: 'Computes pro-rata dividend shares per member based on annual net profit and share capital holdings.',
      lastRunStats: { membersComputed: 1380, totalDividendsKES: 18400000 },
    },
  ];

  static executionLogs = [
    { id: 'exec_101', jobId: 'job_due_reminders', timestamp: '2026-07-28 08:00:00', status: 'SUCCESS', details: 'Sent 86 SMS reminders successfully.' },
    { id: 'exec_102', jobId: 'job_late_penalties', timestamp: '2026-07-28 01:00:00', status: 'SUCCESS', details: 'Applied penalties to 14 defaulted accounts.' },
  ];

  static getJobs() {
    return this.automationJobs;
  }

  static runJob(jobId) {
    const job = this.automationJobs.find((j) => j.id === jobId);
    if (!job) throw new Error('Job not found');

    job.lastRun = new Date().toISOString().replace('T', ' ').substring(0, 19);
    
    const log = {
      id: `exec_${Date.now()}`,
      jobId,
      timestamp: job.lastRun,
      status: 'SUCCESS',
      details: `Manual trigger execution finished cleanly. Processed tasks for ${job.name}.`,
    };

    this.executionLogs.unshift(log);
    return { job, log };
  }

  static getLogs() {
    return this.executionLogs;
  }
}

export default ProcessAutomationEngine;
