// Internal Messaging & Contextual Chat Service
export class InternalMessagingService {
  static messages = [
    {
      id: 'msg_01',
      entityType: 'LOAN', // LOAN, MEMBER, TRANSACTION, EXPENSE
      entityId: 'LN-2026-0891',
      senderRole: 'LOAN_OFFICER',
      senderName: 'Mary Wambui (Loan Officer)',
      recipientRole: 'BRANCH_MANAGER',
      text: 'Verified member KRA PIN and payslips for Loan LN-2026-0891. Guarantors have signed digitally.',
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: 'msg_02',
      entityType: 'LOAN',
      entityId: 'LN-2026-0891',
      senderRole: 'BRANCH_MANAGER',
      senderName: 'Peter Njuguna (Branch Manager)',
      recipientRole: 'CREDIT_COMMITTEE',
      text: 'Recommended for approval. Member eligibility score is 92%. DTI is well within 50% limit.',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'msg_03',
      entityType: 'MEMBER',
      entityId: '1',
      senderRole: 'ACCOUNTANT',
      senderName: 'David Koech (Accountant)',
      recipientRole: 'MEMBER',
      text: 'Your annual dividend receipt of KES 14,500 has been processed and posted to your savings account.',
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
  ];

  static getMessagesForEntity(entityType, entityId) {
    return this.messages.filter((m) => m.entityType === entityType && m.entityId === String(entityId));
  }

  static sendMessage({ entityType, entityId, senderRole, senderName, recipientRole, text }) {
    const newMsg = {
      id: `msg_${Date.now()}`,
      entityType,
      entityId: String(entityId),
      senderRole,
      senderName: senderName || 'System User',
      recipientRole: recipientRole || 'ALL',
      text,
      timestamp: new Date().toISOString(),
    };
    this.messages.push(newMsg);
    return newMsg;
  }
}

export default InternalMessagingService;
