import loanService from '../services/loanService.js';
import { successResponse, createdResponse, paginatedResponse } from '../utils/response.js';

class LoanController {
  async apply(req, res, next) {
    try {
      const loan = await loanService.apply(req.user.organizationId, req.user.branchId, req.body, req.user.id);
      return createdResponse(res, { message: 'Loan application submitted successfully.', data: loan });
    } catch (err) { next(err); }
  }
  async list(req, res, next) {
    try {
      const result = await loanService.list(req.user.organizationId, req.query);
      return paginatedResponse(res, { data: result.loans, total: result.total, page: result.page, limit: result.limit });
    } catch (err) { next(err); }
  }
  async getById(req, res, next) {
    try {
      const loan = await loanService.getById(req.params.id, req.user.organizationId);
      return successResponse(res, { data: loan });
    } catch (err) { next(err); }
  }
  async approve(req, res, next) {
    try {
      const loan = await loanService.approve(req.params.id, req.user.organizationId, req.user.id, req.body.notes);
      return successResponse(res, { message: 'Loan approved.', data: loan });
    } catch (err) { next(err); }
  }
  async reject(req, res, next) {
    try {
      const loan = await loanService.reject(req.params.id, req.user.organizationId, req.user.id, req.body.reason);
      return successResponse(res, { message: 'Loan rejected.', data: loan });
    } catch (err) { next(err); }
  }
  async disburse(req, res, next) {
    try {
      const loan = await loanService.disburse(req.params.id, req.user.organizationId, req.user.id, req.body);
      return successResponse(res, { message: 'Loan disbursed successfully.', data: loan });
    } catch (err) { next(err); }
  }
  async repay(req, res, next) {
    try {
      const loan = await loanService.repay(req.params.id, req.user.organizationId, { ...req.body, processedBy: req.user.id });
      return successResponse(res, { message: 'Repayment recorded successfully.', data: loan });
    } catch (err) { next(err); }
  }
  async getSchedule(req, res, next) {
    try {
      const result = await loanService.getRepaymentSchedule(req.params.id, req.user.organizationId);
      return successResponse(res, { data: result });
    } catch (err) { next(err); }
  }
  async addGuarantor(req, res, next) {
    try {
      const guarantor = await loanService.addGuarantor(req.params.id, req.user.organizationId, req.body);
      return createdResponse(res, { message: 'Guarantor added.', data: guarantor });
    } catch (err) { next(err); }
  }
  async getStats(req, res, next) {
    try {
      const stats = await loanService.getStats(req.user.organizationId);
      return successResponse(res, { data: stats });
    } catch (err) { next(err); }
  }
}
export default new LoanController();
