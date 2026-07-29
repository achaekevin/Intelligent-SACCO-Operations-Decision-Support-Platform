import { Router } from 'express';
import * as enterpriseCtrl from '../controllers/enterpriseSuiteController.js';

const router = Router();

// 1. Eligibility Engine
router.post('/loans/evaluate-eligibility', enterpriseCtrl.evaluateLoanEligibility);

// 2. Workflows
router.get('/workflows', enterpriseCtrl.getWorkflows);
router.post('/workflows', enterpriseCtrl.createWorkflow);
router.get('/workflows/pending', enterpriseCtrl.getPendingWorkflows);

// 3. Rules & Compliance
router.get('/rules', enterpriseCtrl.getRules);
router.post('/rules', enterpriseCtrl.createRule);
router.patch('/rules/:id/toggle', enterpriseCtrl.toggleRule);
router.get('/rules/compliance-summary', enterpriseCtrl.getComplianceSummary);

// 4. Digital Documents
router.get('/documents/member/:memberId', enterpriseCtrl.getMemberDocuments);
router.post('/documents/sign', enterpriseCtrl.signDocument);

// 5. Member Timeline
router.get('/members/:memberId/timeline', enterpriseCtrl.getMemberTimeline);

// 6. Financial Health
router.get('/dashboard/financial-health', enterpriseCtrl.getFinancialHealth);

// 7. Smart Alerts
router.get('/smart-alerts', enterpriseCtrl.getSmartAlerts);
router.post('/smart-alerts/resolve', enterpriseCtrl.resolveSmartAlert);

// 8. Fraud Detection
router.get('/fraud-alerts', enterpriseCtrl.getFraudFlags);

// 9. Central Approvals
router.get('/approvals/central', enterpriseCtrl.getCentralApprovals);
router.post('/approvals/process', enterpriseCtrl.processCentralApproval);
router.post('/approvals/process-batch', enterpriseCtrl.processBatchApprovals);

// 10. Dynamic Product Builder
router.get('/products', enterpriseCtrl.getProducts);
router.post('/products', enterpriseCtrl.createProduct);

// 12. Process Automation
router.get('/automation/jobs', enterpriseCtrl.getAutomationJobs);
router.post('/automation/jobs/:jobId/run', enterpriseCtrl.triggerAutomationJob);

// 13. Internal Messaging
router.get('/messages', enterpriseCtrl.getInternalMessages);
router.post('/messages', enterpriseCtrl.sendInternalMessage);

// 14. Analytics Center
router.get('/analytics/overview', enterpriseCtrl.getAnalyticsOverview);

export default router;
