// Workflow Automation Engine Service
// In-memory / persistent workflow store supporting configurable approval chains

export class WorkflowEngine {
  static workflows = [
    {
      id: 'wf_loan_standard',
      name: 'Standard Loan Approval Workflow',
      entityType: 'LOAN',
      steps: [
        { level: 1, role: 'LOAN_OFFICER', label: 'Loan Officer Verification' },
        { level: 2, role: 'BRANCH_MANAGER', label: 'Branch Manager Review' },
        { level: 3, role: 'CREDIT_COMMITTEE', label: 'Credit Committee Approval' },
        { level: 4, role: 'CEO', label: 'CEO Final Sanction' },
      ],
      minAmountForCeo: 2000000,
    },
    {
      id: 'wf_membership',
      name: 'Member Onboarding Approval',
      entityType: 'MEMBERSHIP',
      steps: [
        { level: 1, role: 'REGISTRATION_OFFICER', label: 'Document & KYC Verification' },
        { level: 2, role: 'BRANCH_MANAGER', label: 'Branch Manager Approval' },
      ],
    },
    {
      id: 'wf_withdrawal',
      name: 'Large Savings Withdrawal Approval',
      entityType: 'WITHDRAWAL',
      steps: [
        { level: 1, role: 'TELLER', label: 'Teller Counter Check' },
        { level: 2, role: 'ACCOUNTANT', label: 'Accountant Authorization' },
        { level: 3, role: 'BRANCH_MANAGER', label: 'Branch Manager Clearance' },
      ],
    },
    {
      id: 'wf_expense',
      name: 'Operational Expense Approval',
      entityType: 'EXPENSE',
      steps: [
        { level: 1, role: 'ACCOUNTANT', label: 'Voucher Verification' },
        { level: 2, role: 'FINANCE_MANAGER', label: 'Budget Clearance' },
        { level: 3, role: 'CEO', label: 'CEO Expenditure Approval' },
      ],
    },
  ];

  static instances = [];

  static getWorkflows() {
    return this.workflows;
  }

  static createWorkflow(newWf) {
    const wf = {
      id: `wf_${Date.now()}`,
      ...newWf,
      createdAt: new Date().toISOString(),
    };
    this.workflows.push(wf);
    return wf;
  }

  static updateWorkflow(id, updated) {
    const index = this.workflows.findIndex((w) => w.id === id);
    if (index !== -1) {
      this.workflows[index] = { ...this.workflows[index], ...updated };
      return this.workflows[index];
    }
    return null;
  }

  static initiateInstance({ entityType, entityId, amount, requestedBy }) {
    const workflow = this.workflows.find((w) => w.entityType === entityType) || this.workflows[0];
    
    // Filter steps based on conditions (e.g. CEO only if amount > threshold)
    let activeSteps = [...workflow.steps];
    if (workflow.minAmountForCeo && amount < workflow.minAmountForCeo) {
      activeSteps = activeSteps.filter((s) => s.role !== 'CEO');
    }

    const instance = {
      instanceId: `inst_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      workflowId: workflow.id,
      workflowName: workflow.name,
      entityType,
      entityId,
      amount,
      requestedBy,
      currentStepIndex: 0,
      currentRole: activeSteps[0].role,
      currentStepLabel: activeSteps[0].label,
      status: 'IN_PROGRESS', // IN_PROGRESS, APPROVED, REJECTED
      history: [
        {
          step: 0,
          action: 'INITIATED',
          performedBy: requestedBy || 'System',
          timestamp: new Date().toISOString(),
          comments: 'Workflow execution started',
        },
      ],
      steps: activeSteps,
    };

    this.instances.push(instance);
    return instance;
  }

  static advanceStep({ instanceId, userRole, userName, action, comments }) {
    const inst = this.instances.find((i) => i.instanceId === instanceId);
    if (!inst) throw new Error('Workflow instance not found');

    if (inst.status !== 'IN_PROGRESS') {
      throw new Error(`Workflow instance is already ${inst.status}`);
    }

    const currentStep = inst.steps[inst.currentStepIndex];

    inst.history.push({
      step: inst.currentStepIndex + 1,
      role: userRole,
      performedBy: userName,
      action, // APPROVE, REJECT, ESCALATE
      comments,
      timestamp: new Date().toISOString(),
    });

    if (action === 'REJECT') {
      inst.status = 'REJECTED';
      return inst;
    }

    if (inst.currentStepIndex + 1 < inst.steps.length) {
      inst.currentStepIndex += 1;
      inst.currentRole = inst.steps[inst.currentStepIndex].role;
      inst.currentStepLabel = inst.steps[inst.currentStepIndex].label;
    } else {
      inst.status = 'APPROVED';
    }

    return inst;
  }

  static getPendingInstances(roleFilter = null) {
    let pending = this.instances.filter((i) => i.status === 'IN_PROGRESS');
    if (roleFilter) {
      pending = pending.filter((i) => i.currentRole === roleFilter);
    }
    return pending;
  }
}

export default WorkflowEngine;
