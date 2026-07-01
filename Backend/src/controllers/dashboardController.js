import dashboardService from '../services/dashboardService.js';
import { successResponse } from '../utils/response.js';

class DashboardController {
  // Admin Dashboard Stats
  async getAdminStats(req, res, next) {
    try {
      const stats = await dashboardService.getAdminStats(req.user.organizationId);
      return successResponse(res, { data: stats });
    } catch (err) {
      next(err);
    }
  }

  // Admin Recent Transactions
  async getRecentTransactions(req, res, next) {
    try {
      const { limit = 10 } = req.query;
      const transactions = await dashboardService.getRecentTransactions(
        req.user.organizationId,
        parseInt(limit)
      );
      return successResponse(res, { data: transactions });
    } catch (err) {
      next(err);
    }
  }

  // Member Dashboard Stats
  async getMemberStats(req, res, next) {
    try {
      const stats = await dashboardService.getMemberStats(
        req.user.organizationId,
        req.user.id
      );
      return successResponse(res, { data: stats });
    } catch (err) {
      next(err);
    }
  }

  // Member Recent Transactions
  async getMemberTransactions(req, res, next) {
    try {
      const { limit = 10 } = req.query;
      const transactions = await dashboardService.getMemberTransactions(
        req.user.organizationId,
        req.user.id,
        parseInt(limit)
      );
      return successResponse(res, { data: transactions });
    } catch (err) {
      next(err);
    }
  }

  // Chart Data - Savings Growth
  async getSavingsGrowth(req, res, next) {
    try {
      const { months = 6 } = req.query;
      const data = await dashboardService.getSavingsGrowth(
        req.user.organizationId,
        parseInt(months)
      );
      return successResponse(res, { data });
    } catch (err) {
      next(err);
    }
  }

  // Chart Data - Member Growth
  async getMemberGrowth(req, res, next) {
    try {
      const { months = 6 } = req.query;
      const data = await dashboardService.getMemberGrowth(
        req.user.organizationId,
        parseInt(months)
      );
      return successResponse(res, { data });
    } catch (err) {
      next(err);
    }
  }
}

export default new DashboardController();
