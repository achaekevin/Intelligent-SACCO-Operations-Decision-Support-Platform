// Fraud Detection & Anomaly Monitoring Engine
export class FraudDetectionEngine {
  static fraudFlags = [
    {
      id: 'frd_01',
      ruleName: 'Same User Self-Approval Violation',
      riskScore: 'CRITICAL', // CRITICAL, HIGH, MEDIUM
      entityType: 'LOAN_APPROVAL',
      entityId: 'L-8041',
      triggeredBy: 'user_teller_02',
      details: 'User attempt to initiate and approve their own loan request of KES 500,000.',
      status: 'BLOCKED',
      timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
    },
    {
      id: 'frd_02',
      ruleName: 'Duplicate National ID Detected',
      riskScore: 'HIGH',
      entityType: 'MEMBER_REGISTRATION',
      entityId: 'MEM-9921',
      triggeredBy: 'system',
      details: 'National ID 28471920 matches existing active member MEM-00124 (John Kamau).',
      status: 'UNDER_INVESTIGATION',
      timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
    },
    {
      id: 'frd_03',
      ruleName: 'Multiple Accounts Using Single Phone Number',
      riskScore: 'HIGH',
      entityType: 'ACCOUNT_ALERT',
      entityId: 'PHONE_0722123456',
      triggeredBy: 'system',
      details: 'Phone number +254722123456 registered across 4 separate member accounts.',
      status: 'FLAGGED',
      timestamp: new Date(Date.now() - 3600000 * 14).toISOString(),
    },
    {
      id: 'frd_04',
      ruleName: 'Transaction Outside Business Hours',
      riskScore: 'MEDIUM',
      entityType: 'SAVINGS_WITHDRAWAL',
      entityId: 'TXN-9028',
      triggeredBy: 'api_gateway',
      details: 'High-value withdrawal of KES 350,000 processed at 02:45 AM (Non-operational window).',
      status: 'FLAGGED',
      timestamp: new Date(Date.now() - 3600000 * 20).toISOString(),
    },
    {
      id: 'frd_05',
      ruleName: 'Excessive Failed Login Attempts',
      riskScore: 'MEDIUM',
      entityType: 'USER_AUTH',
      entityId: 'user_admin_branch2',
      triggeredBy: 'auth_security',
      details: '12 failed password attempts within 3 minutes from IP 197.232.14.88.',
      status: 'ACCOUNT_LOCKED',
      timestamp: new Date(Date.now() - 3600000 * 36).toISOString(),
    },
  ];

  static getFraudFlags() {
    return this.fraudFlags;
  }

  static evaluateTransaction(tx) {
    const flags = [];

    // Check self-approval
    if (tx.initiatorId && tx.approverId && tx.initiatorId === tx.approverId) {
      flags.push({
        rule: 'Same User Self-Approval Violation',
        risk: 'CRITICAL',
        msg: 'User cannot approve their own financial transaction.',
      });
    }

    // Check transaction timing
    const hour = new Date().getHours();
    if (hour < 5 || hour > 22) {
      flags.push({
        rule: 'Transaction Outside Business Hours',
        risk: 'MEDIUM',
        msg: 'Transaction attempted outside standard business hours (05:00 - 22:00).',
      });
    }

    // Check high value threshold without 2FA
    if (tx.amount > 500000 && !tx.hasMfaVerified) {
      flags.push({
        rule: 'Unverified High Value Transaction',
        risk: 'HIGH',
        msg: 'Transactions above KES 500,000 require secondary MFA authorization.',
      });
    }

    return flags;
  }
}

export default FraudDetectionEngine;
