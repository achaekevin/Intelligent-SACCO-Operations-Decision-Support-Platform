import savingsService from '../services/savingsService.js';
import { successResponse, createdResponse, paginatedResponse } from '../utils/response.js';

class SavingsController {
  // ─── Accounts ─────────────────────────────────────────────────
  async createAccount(req, res, next) {
    try {
      const account = await savingsService.createAccount(
        req.user.organizationId,
        req.body.branchId || req.user.branchId,
        req.body.memberId,
        req.body,
      );
      return createdResponse(res, { message: 'Savings account opened.', data: account });
    } catch (err) { next(err); }
  }

  async listAccounts(req, res, next) {
    try {
      const result = await savingsService.getAccounts(req.user.organizationId, req.query);
      return paginatedResponse(res, { data: result.accounts, total: result.total, page: result.page, limit: result.limit });
    } catch (err) { next(err); }
  }

  async getAccountById(req, res, next) {
    try {
      const account = await savingsService.getAccountById(req.params.id, req.user.organizationId);
      return successResponse(res, { data: account });
    } catch (err) { next(err); }
  }

  async getMemberAccounts(req, res, next) {
    try {
      const accounts = await savingsService.getAccountsByMember(req.params.memberId, req.user.organizationId);
      return successResponse(res, { data: accounts });
    } catch (err) { next(err); }
  }

  // ─── Transactions ─────────────────────────────────────────────
  async deposit(req, res, next) {
    try {
      const result = await savingsService.deposit(
        req.user.organizationId,
        req.user.branchId,
        { ...req.body, processedBy: req.user.id },
      );
      return createdResponse(res, { message: 'Deposit processed successfully.', data: result });
    } catch (err) { next(err); }
  }

  async withdraw(req, res, next) {
    try {
      const result = await savingsService.withdraw(
        req.user.organizationId,
        req.user.branchId,
        { ...req.body, processedBy: req.user.id },
      );
      return successResponse(res, { message: 'Withdrawal processed successfully.', data: result });
    } catch (err) { next(err); }
  }

  async transfer(req, res, next) {
    try {
      const result = await savingsService.transfer(req.user.organizationId, {
        ...req.body,
        processedBy: req.user.id,
      });
      return successResponse(res, { message: 'Transfer processed successfully.', data: result });
    } catch (err) { next(err); }
  }

  async reverseTransaction(req, res, next) {
    try {
      const result = await savingsService.reverseTransaction(
        req.params.transactionId,
        req.user.organizationId,
        { reason: req.body.reason, reversedBy: req.user.id },
      );
      return successResponse(res, { message: 'Transaction reversed.', data: result });
    } catch (err) { next(err); }
  }

  async listTransactions(req, res, next) {
    try {
      const result = await savingsService.getTransactions(req.user.organizationId, req.query);
      return paginatedResponse(res, { data: result.transactions, total: result.total, page: result.page, limit: result.limit });
    } catch (err) { next(err); }
  }

  async getAccountTransactions(req, res, next) {
    try {
      const result = await savingsService.getAccountTransactions(req.params.id, req.user.organizationId, req.query);
      return paginatedResponse(res, { data: result.transactions, total: result.total, page: result.page, limit: result.limit });
    } catch (err) { next(err); }
  }
}

export default new SavingsController();
