import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: `${API_BASE}/enterprise`,
  withCredentials: true,
});

export const evaluateLoanEligibility = async (payload) => {
  const res = await api.post('/loans/evaluate-eligibility', payload);
  return res.data.data;
};

export const fetchWorkflows = async () => {
  const res = await api.get('/workflows');
  return res.data.data;
};

export const fetchRules = async () => {
  const res = await api.get('/rules');
  return res.data.data;
};

export const fetchComplianceSummary = async () => {
  const res = await api.get('/rules/compliance-summary');
  return res.data.data;
};

export const fetchMemberDocuments = async (memberId = 1) => {
  const res = await api.get(`/documents/member/${memberId}`);
  return res.data.data;
};

export const signDocument = async (docId, signerName) => {
  const res = await api.post('/documents/sign', { docId, signerName });
  return res.data.data;
};

export const fetchMemberTimeline = async (memberId = 1) => {
  const res = await api.get(`/members/${memberId}/timeline`);
  return res.data.data;
};

export const fetchFinancialHealth = async () => {
  const res = await api.get('/dashboard/financial-health');
  return res.data.data;
};

export const fetchSmartAlerts = async () => {
  const res = await api.get('/smart-alerts');
  return res.data.data;
};

export const resolveSmartAlert = async (alertId, note) => {
  const res = await api.post('/smart-alerts/resolve', { alertId, note });
  return res.data.data;
};

export const fetchFraudFlags = async () => {
  const res = await api.get('/fraud-alerts');
  return res.data.data;
};

export const fetchCentralApprovals = async (category = 'ALL') => {
  const res = await api.get(`/approvals/central?category=${category}`);
  return res.data.data;
};

export const processCentralApproval = async (approvalId, action, notes) => {
  const res = await api.post('/approvals/process', { approvalId, action, notes });
  return res.data.data;
};

export const fetchProducts = async (type = 'ALL') => {
  const res = await api.get(`/products?type=${type}`);
  return res.data.data;
};

export const createProduct = async (productData) => {
  const res = await api.post('/products', productData);
  return res.data.data;
};

export const fetchAutomationJobs = async () => {
  const res = await api.get('/automation/jobs');
  return res.data;
};

export const runAutomationJob = async (jobId) => {
  const res = await api.post(`/automation/jobs/${jobId}/run`);
  return res.data.data;
};

export const fetchAnalyticsOverview = async () => {
  const res = await api.get('/analytics/overview');
  return res.data.data;
};

export const fetchInternalMessages = async (entityType, entityId) => {
  const res = await api.get(`/messages?entityType=${entityType}&entityId=${entityId}`);
  return res.data.data;
};

export const sendInternalMessage = async (payload) => {
  const res = await api.post('/messages', payload);
  return res.data.data;
};

export default api;
