import memberService from '../services/memberService.js';
import { successResponse, createdResponse, paginatedResponse } from '../utils/response.js';
import path from 'path';

class MemberController {
  async register(req, res, next) {
    try {
      const { branchId, ...data } = req.body;
      const member = await memberService.register(
        req.user.organizationId,
        branchId || req.user.branchId,
        data,
        req.user.id,
      );
      return createdResponse(res, { message: 'Member registered successfully.', data: member });
    } catch (err) { next(err); }
  }

  async list(req, res, next) {
    try {
      const { members, total, page, limit } = await memberService.list(req.user.organizationId, req.query);
      return paginatedResponse(res, { data: members, total, page, limit });
    } catch (err) { next(err); }
  }

  async getById(req, res, next) {
    try {
      const member = await memberService.getById(req.params.id, req.user.organizationId);
      return successResponse(res, { data: member });
    } catch (err) { next(err); }
  }

  async update(req, res, next) {
    try {
      const member = await memberService.update(req.params.id, req.user.organizationId, req.body, req.user.id);
      return successResponse(res, { message: 'Member updated successfully.', data: member });
    } catch (err) { next(err); }
  }

  async activate(req, res, next) {
    try {
      const member = await memberService.activate(req.params.id, req.user.organizationId, req.user.id);
      return successResponse(res, { message: 'Member activated successfully.', data: member });
    } catch (err) { next(err); }
  }

  async suspend(req, res, next) {
    try {
      const member = await memberService.suspend(req.params.id, req.user.organizationId, req.user.id, req.body.reason);
      return successResponse(res, { message: 'Member suspended.', data: member });
    } catch (err) { next(err); }
  }

  async addNextOfKin(req, res, next) {
    try {
      const kin = await memberService.addNextOfKin(req.params.id, req.user.organizationId, req.body, req.user.id);
      return createdResponse(res, { message: 'Next of kin added.', data: kin });
    } catch (err) { next(err); }
  }

  async uploadDocument(req, res, next) {
    try {
      if (!req.file) {
        const { errorResponse } = await import('../utils/response.js');
        return errorResponse(res, { message: 'No file uploaded.', statusCode: 400 });
      }
      const fileInfo = {
        type: req.body.documentType || 'other',
        filename: req.file.filename,
        path: req.file.path,
        mimetype: req.file.mimetype,
        size: req.file.size,
      };
      const doc = await memberService.uploadDocument(req.params.id, req.user.organizationId, fileInfo, req.user.id);
      return createdResponse(res, { message: 'Document uploaded successfully.', data: doc });
    } catch (err) { next(err); }
  }

  async getStatement(req, res, next) {
    try {
      const statement = await memberService.getStatement(
        req.params.id,
        req.user.organizationId,
        { startDate: req.query.startDate, endDate: req.query.endDate },
      );
      return successResponse(res, { data: statement });
    } catch (err) { next(err); }
  }

  async getStats(req, res, next) {
    try {
      const stats = await memberService.getStats(req.user.organizationId);
      return successResponse(res, { data: stats });
    } catch (err) { next(err); }
  }
}

export default new MemberController();
