import reportService from '../services/reportService.js';
import { successResponse } from '../utils/response.js';

class ReportsController {
  async membersReport(req, res, next) {
    try {
      const { format = 'json' } = req.query;
      if (format === 'csv') {
        const csv = await reportService.membersCSV(req.user.organizationId, req.query);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="members-report-${Date.now()}.csv"`);
        return res.send(csv);
      }
      if (format === 'excel') {
        const buffer = await reportService.membersExcel(req.user.organizationId, req.query);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="members-report-${Date.now()}.xlsx"`);
        return res.send(buffer);
      }
      if (format === 'pdf') {
        const buffer = await reportService.membersPDF(req.user.organizationId, req.query);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="members-report-${Date.now()}.pdf"`);
        return res.send(buffer);
      }
      const data = await reportService.getMembersData(req.user.organizationId, req.query);
      return successResponse(res, { data, message: 'Members report generated.' });
    } catch (err) { next(err); }
  }

  async savingsReport(req, res, next) {
    try {
      const { format = 'json' } = req.query;
      if (format === 'csv') {
        const csv = await reportService.savingsCSV(req.user.organizationId, req.query);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="savings-report-${Date.now()}.csv"`);
        return res.send(csv);
      }
      if (format === 'excel') {
        const buffer = await reportService.membersExcel(req.user.organizationId, req.query);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="savings-report-${Date.now()}.xlsx"`);
        return res.send(buffer);
      }
      const data = await reportService.getSavingsData(req.user.organizationId, req.query);
      return successResponse(res, { data, message: 'Savings report generated.' });
    } catch (err) { next(err); }
  }

  async loansReport(req, res, next) {
    try {
      const { format = 'json' } = req.query;
      if (format === 'csv') {
        const csv = await reportService.loansCSV(req.user.organizationId, req.query);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="loans-report-${Date.now()}.csv"`);
        return res.send(csv);
      }
      if (format === 'excel') {
        const buffer = await reportService.loansExcel(req.user.organizationId, req.query);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="loans-report-${Date.now()}.xlsx"`);
        return res.send(buffer);
      }
      if (format === 'pdf') {
        const buffer = await reportService.loansPDF(req.user.organizationId, req.query);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="loans-report-${Date.now()}.pdf"`);
        return res.send(buffer);
      }
      const data = await reportService.getLoansData(req.user.organizationId, req.query);
      return successResponse(res, { data, message: 'Loans report generated.' });
    } catch (err) { next(err); }
  }

  async memberStatement(req, res, next) {
    try {
      const { format = 'json' } = req.query;
      const memberId = req.params.memberId || req.user.memberId;
      
      if (format === 'pdf') {
        const buffer = await reportService.memberStatementPDF(memberId, req.user.organizationId, req.query);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="member-statement-${Date.now()}.pdf"`);
        return res.send(buffer);
      }
      
      const data = await reportService.getMemberStatement(memberId, req.user.organizationId, req.query);
      return successResponse(res, { data, message: 'Member statement generated.' });
    } catch (err) { next(err); }
  }

  async transactionsReport(req, res, next) {
    try {
      const { format = 'json' } = req.query;
      
      if (format === 'csv') {
        const csv = await reportService.transactionsCSV(req.user.organizationId, req.query);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="transactions-report-${Date.now()}.csv"`);
        return res.send(csv);
      }
      
      const data = await reportService.getTransactionsData(req.user.organizationId, req.query);
      return successResponse(res, { data, message: 'Transactions report generated.' });
    } catch (err) { next(err); }
  }

  async financialReport(req, res, next) {
    try {
      const data = await reportService.getFinancialReport(req.user.organizationId, req.query);
      return successResponse(res, { data, message: 'Financial report generated.' });
    } catch (err) { next(err); }
  }

  async list(req, res, next) {
    try {
      return successResponse(res, {
        message: 'Available reports',
        data: [
          { name: 'Members Report',      endpoint: '/api/v1/reports/members',      formats: ['json', 'csv', 'excel', 'pdf'] },
          { name: 'Savings Report',      endpoint: '/api/v1/reports/savings',      formats: ['json', 'csv', 'excel'] },
          { name: 'Loans Report',        endpoint: '/api/v1/reports/loans',        formats: ['json', 'csv', 'excel', 'pdf'] },
          { name: 'Member Statement',    endpoint: '/api/v1/reports/statement/:memberId', formats: ['json', 'pdf'] },
          { name: 'Transactions Report', endpoint: '/api/v1/reports/transactions', formats: ['json', 'csv'] },
          { name: 'Financial Report',    endpoint: '/api/v1/reports/financial',    formats: ['json'] },
        ],
      });
    } catch (err) { next(err); }
  }
}

export default new ReportsController();
