import branchService from '../services/branchService.js';
import { successResponse, createdResponse, paginatedResponse } from '../utils/response.js';

class BranchController {
  async create(req, res, next) {
    try {
      const branch = await branchService.create(req.user.organizationId, req.body, req.user.id);
      return createdResponse(res, { message: 'Branch created successfully.', data: branch });
    } catch (err) { next(err); }
  }

  async list(req, res, next) {
    try {
      const { branches, total, page, limit } = await branchService.list(req.user.organizationId, req.query);
      return paginatedResponse(res, { data: branches, total, page, limit });
    } catch (err) { next(err); }
  }

  async getById(req, res, next) {
    try {
      const branch = await branchService.getById(req.params.id, req.user.organizationId);
      return successResponse(res, { data: branch });
    } catch (err) { next(err); }
  }

  async update(req, res, next) {
    try {
      const branch = await branchService.update(req.params.id, req.user.organizationId, req.body);
      return successResponse(res, { message: 'Branch updated successfully.', data: branch });
    } catch (err) { next(err); }
  }

  async delete(req, res, next) {
    try {
      await branchService.delete(req.params.id, req.user.organizationId);
      return successResponse(res, { message: 'Branch deleted successfully.' });
    } catch (err) { next(err); }
  }

  async getStats(req, res, next) {
    try {
      const stats = await branchService.getStats(req.params.id, req.user.organizationId);
      return successResponse(res, { data: stats });
    } catch (err) { next(err); }
  }

  async assignManager(req, res, next) {
    try {
      const branch = await branchService.assignManager(req.params.id, req.user.organizationId, req.body.managerId);
      return successResponse(res, { message: 'Branch manager assigned.', data: branch });
    } catch (err) { next(err); }
  }
}

export default new BranchController();
