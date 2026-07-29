import { LoanEligibilityEngine } from '../services/LoanEligibilityEngine.js';
import { WorkflowEngine } from '../services/WorkflowEngine.js';
import { RuleEngine } from '../services/RuleEngine.js';
import { DocumentWorkflowService } from '../services/DocumentWorkflowService.js';
import { MemberTimelineService } from '../services/MemberTimelineService.js';
import { FinancialHealthService } from '../services/FinancialHealthService.js';
import { SmartAlertService } from '../services/SmartAlertService.js';
import { FraudDetectionEngine } from '../services/FraudDetectionEngine.js';
import { CentralApprovalService } from '../services/CentralApprovalService.js';
import { ProductBuilderService } from '../services/ProductBuilderService.js';
import { ProcessAutomationEngine } from '../services/ProcessAutomationEngine.js';
import { AnalyticsService } from '../services/AnalyticsService.js';
import { InternalMessagingService } from '../services/InternalMessagingService.js';

export const evaluateLoanEligibility = async (req, res, next) => {
  try {
    const { memberId = 1, requestedAmount = 450000, loanProductId, monthlyIncome } = req.body;
    const result = await LoanEligibilityEngine.evaluateEligibility({
      memberId: parseInt(memberId),
      requestedAmount: parseFloat(requestedAmount),
      loanProductId,
      monthlyIncome: monthlyIncome ? parseFloat(monthlyIncome) : undefined,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const getWorkflows = (req, res) => {
  res.json({ success: true, data: WorkflowEngine.getWorkflows() });
};

export const createWorkflow = (req, res) => {
  const wf = WorkflowEngine.createWorkflow(req.body);
  res.status(201).json({ success: true, data: wf });
};

export const getPendingWorkflows = (req, res) => {
  const { role } = req.query;
  res.json({ success: true, data: WorkflowEngine.getPendingInstances(role) });
};

export const getRules = (req, res) => {
  res.json({ success: true, data: RuleEngine.getRules() });
};

export const createRule = (req, res) => {
  const rule = RuleEngine.createRule(req.body);
  res.status(201).json({ success: true, data: rule });
};

export const toggleRule = (req, res) => {
  const rule = RuleEngine.toggleRule(req.params.id);
  res.json({ success: true, data: rule });
};

export const getComplianceSummary = (req, res) => {
  res.json({ success: true, data: RuleEngine.getComplianceSummary() });
};

export const getMemberDocuments = (req, res) => {
  const docs = DocumentWorkflowService.getMemberDocuments(req.params.memberId || 1);
  res.json({ success: true, data: docs });
};

export const signDocument = (req, res) => {
  const { docId, signerName = 'Current User', signerId = 1 } = req.body;
  const doc = DocumentWorkflowService.signDocument(docId, signerName, signerId);
  res.json({ success: true, data: doc });
};

export const getMemberTimeline = async (req, res, next) => {
  try {
    const data = await MemberTimelineService.getMemberTimeline(req.params.memberId || 1);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getFinancialHealth = (req, res) => {
  res.json({ success: true, data: FinancialHealthService.getFinancialHealthOverview() });
};

export const getSmartAlerts = (req, res) => {
  const { severity, status } = req.query;
  res.json({ success: true, data: SmartAlertService.getAlerts({ severity, status }) });
};

export const resolveSmartAlert = (req, res) => {
  const { alertId, note } = req.body;
  const alert = SmartAlertService.resolveAlert(alertId, note);
  res.json({ success: true, data: alert });
};

export const getFraudFlags = (req, res) => {
  res.json({ success: true, data: FraudDetectionEngine.getFraudFlags() });
};

export const getCentralApprovals = (req, res) => {
  const { category } = req.query;
  res.json({ success: true, data: CentralApprovalService.getPendingApprovals(category) });
};

export const processCentralApproval = (req, res) => {
  const { approvalId, action, notes } = req.body;
  const result = CentralApprovalService.processAction(approvalId, action, notes, req.user?.name);
  res.json({ success: true, data: result });
};

export const processBatchApprovals = (req, res) => {
  const { approvalIds, action, notes } = req.body;
  const result = CentralApprovalService.processBatch(approvalIds, action, notes, req.user?.name);
  res.json({ success: true, data: result });
};

export const getProducts = (req, res) => {
  const { type } = req.query;
  res.json({ success: true, data: ProductBuilderService.getProducts(type) });
};

export const createProduct = (req, res) => {
  const prod = ProductBuilderService.createProduct(req.body);
  res.status(201).json({ success: true, data: prod });
};

export const getAutomationJobs = (req, res) => {
  res.json({ success: true, data: ProcessAutomationEngine.getJobs(), logs: ProcessAutomationEngine.getLogs() });
};

export const triggerAutomationJob = (req, res) => {
  const result = ProcessAutomationEngine.runJob(req.params.jobId);
  res.json({ success: true, data: result });
};

export const getAnalyticsOverview = (req, res) => {
  res.json({ success: true, data: AnalyticsService.getAnalyticsOverview() });
};

export const getInternalMessages = (req, res) => {
  const { entityType, entityId } = req.query;
  res.json({ success: true, data: InternalMessagingService.getMessagesForEntity(entityType, entityId) });
};

export const sendInternalMessage = (req, res) => {
  const msg = InternalMessagingService.sendMessage(req.body);
  res.status(201).json({ success: true, data: msg });
};
