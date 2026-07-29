// Smart Alerts & Risk Detection Service
export class SmartAlertService {
  static alerts = [
    {
      id: 'alt_01',
      memberId: 104,
      memberName: 'Peter Ochieng',
      type: 'SAVINGS_DECLINE',
      severity: 'WARNING', // CRITICAL, WARNING, INFO
      title: 'Savings declined for 3 consecutive months',
      details: 'Monthly contributions dropped from KES 15,000 to KES 2,000. Risk of default.',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      status: 'UNRESOLVED',
      suggestedAction: 'Contact member to discuss flexible repayment structure.',
    },
    {
      id: 'alt_02',
      memberId: 88,
      memberName: 'Mary Muthoni',
      type: 'IMPENDING_DEFAULT',
      severity: 'CRITICAL',
      title: 'Member likely to default on Loan #L-4091',
      details: 'Missed 2 consecutive installments. Repayment score dropped to 42%.',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      status: 'UNRESOLVED',
      suggestedAction: 'Issue formal 14-day demand letter & notify guarantors.',
    },
    {
      id: 'alt_03',
      memberId: 215,
      memberName: 'David Kiprop',
      type: 'LARGE_WITHDRAWAL',
      severity: 'WARNING',
      title: 'Large withdrawal detected (KES 850,000)',
      details: 'Requested withdrawal exceeds 60% of total member savings balance.',
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      status: 'UNDER_REVIEW',
      suggestedAction: 'Require double-signature approval from Branch Manager.',
    },
    {
      id: 'alt_04',
      memberId: 302,
      memberName: 'Grace Wambui',
      type: 'GUARANTOR_EXPOSURE',
      severity: 'WARNING',
      title: 'Guarantor exposure exceeds policy limit',
      details: 'Member guaranteeing 5 active loans totaling KES 2,400,000 against KES 450,000 shares.',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      status: 'UNRESOLVED',
      suggestedAction: 'Block further guarantor pledges until balance is reduced.',
    },
    {
      id: 'alt_05',
      memberId: 410,
      memberName: 'Samuel Ndung\'u',
      type: 'UPCOMING_DUE',
      severity: 'INFO',
      title: 'Loan installment due in 7 days (KES 34,500)',
      details: 'Development Loan installment due on 2026-08-05.',
      createdAt: new Date(Date.now() - 3600000 * 30).toISOString(),
      status: 'UNRESOLVED',
      suggestedAction: 'Send automated SMS reminder.',
    },
    {
      id: 'alt_06',
      memberId: 512,
      memberName: 'Alice Chebet',
      type: 'DORMANT_ACCOUNT',
      severity: 'INFO',
      title: 'Dormant account detected (No activity > 12 months)',
      details: 'Account #SAV-9012 has had zero transactions for 380 days.',
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      status: 'UNRESOLVED',
      suggestedAction: 'Archive account & send re-activation notice.',
    },
  ];

  static getAlerts({ severity, status } = {}) {
    let list = this.alerts;
    if (severity) list = list.filter((a) => a.severity === severity);
    if (status) list = list.filter((a) => a.status === status);
    return list;
  }

  static resolveAlert(alertId, resolutionNote) {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.status = 'RESOLVED';
      alert.resolutionNote = resolutionNote;
      alert.resolvedAt = new Date().toISOString();
      return alert;
    }
    return null;
  }
}

export default SmartAlertService;
