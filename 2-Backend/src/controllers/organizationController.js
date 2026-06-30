import organizationService from '../services/organizationService.js';
import { successResponse, createdResponse, paginatedResponse } from '../utils/response.js';

class OrganizationController {
  async list(req, res, next) {
    try {
      const { page = 1, limit = 20, status } = req.query;
      const result = await organizationService.listAll({ page: +page, limit: +limit, status });
      return paginatedResponse(res, { data: result.rows, total: result.count, page: +page, limit: +limit });
    } catch (err) { next(err); }
  }

  async getById(req, res, next) {
    try {
      const org = await organizationService.getById(req.params.id);
      return successResponse(res, { data: org });
    } catch (err) { next(err); }
  }

  async getMyOrganization(req, res, next) {
    try {
      const org = await organizationService.getById(req.user.organizationId);
      return successResponse(res, { data: org });
    } catch (err) { next(err); }
  }

  async update(req, res, next) {
    try {
      const orgId = req.user.role === 'super_admin' ? req.params.id : req.user.organizationId;
      const org = await organizationService.update(orgId, req.body);
      return successResponse(res, { message: 'Organization updated successfully.', data: org });
    } catch (err) { next(err); }
  }

  async updateSettings(req, res, next) {
    try {
      const org = await organizationService.updateSettings(req.user.organizationId, req.body);
      return successResponse(res, { message: 'Settings updated successfully.', data: org });
    } catch (err) { next(err); }
  }

  async updateStatus(req, res, next) {
    try {
      const { status } = req.body;
      const org = await organizationService.updateStatus(req.params.id, status);
      return successResponse(res, { message: `Organization ${status}.`, data: org });
    } catch (err) { next(err); }
  }

  async getStats(req, res, next) {
    try {
      const stats = await organizationService.getStats(req.user.organizationId);
      return successResponse(res, { data: stats });
    } catch (err) { next(err); }
  }
}

export default new OrganizationController();
