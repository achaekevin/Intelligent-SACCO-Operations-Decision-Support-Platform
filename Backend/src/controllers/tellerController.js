import tellerService from '../services/tellerService.js';
import { successResponse, createdResponse } from '../utils/response.js';
import PDFDocument from 'pdfkit';

class TellerController {
  // Generate End of Day Report (PDF)
  async generateEndOfDayReport(req, res, next) {
    try {
      const { date } = req.query;
      const reportDate = date ? new Date(date) : new Date();
      
      const reportData = await tellerService.generateEndOfDayReport(
        req.user.organizationId,
        req.user.id,
        reportDate
      );

      // Create PDF
      const doc = new PDFDocument({ margin: 50 });
      
      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=eod-report-${reportDate.toISOString().split('T')[0]}.pdf`);
      
      doc.pipe(res);

      // Header
      doc.fontSize(20).text('End of Day Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Date: ${reportDate.toDateString()}`, { align: 'center' });
      doc.text(`Teller: ${reportData.teller.name}`, { align: 'center' });
      doc.moveDown(2);

      // Summary Section
      doc.fontSize(16).text('Summary', { underline: true });
      doc.moveDown();
      doc.fontSize(11);
      
      const summary = reportData.summary;
      doc.text(`Total Deposits: KES ${summary.totalDeposits.toLocaleString('en-KE', { minimumFractionDigits: 2 })} (${summary.depositCount} transactions)`);
      doc.text(`Total Withdrawals: KES ${summary.totalWithdrawals.toLocaleString('en-KE', { minimumFractionDigits: 2 })} (${summary.withdrawalCount} transactions)`);
      doc.text(`Cash in Hand: KES ${summary.cashInHand.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`, { bold: true });
      doc.text(`M-Pesa Collections: KES ${summary.mpesaTotal.toLocaleString('en-KE', { minimumFractionDigits: 2 })} (${summary.mpesaCount} transactions)`);
      doc.text(`Pending Transactions: ${summary.pendingCount}`);
      doc.text(`Total Transactions: ${summary.totalTransactions}`);
      doc.moveDown(2);

      // Transactions Table
      doc.fontSize(16).text('Transactions', { underline: true });
      doc.moveDown();
      doc.fontSize(9);

      // Table headers
      const tableTop = doc.y;
      const colWidths = [80, 60, 80, 60, 100, 80];
      const headers = ['Time', 'Type', 'Amount', 'Method', 'Member', 'Status'];
      
      let xPos = 50;
      headers.forEach((header, i) => {
        doc.text(header, xPos, tableTop, { width: colWidths[i], bold: true });
        xPos += colWidths[i];
      });

      doc.moveDown();
      let yPos = doc.y;

      // Table rows
      reportData.transactions.forEach((tx, index) => {
        if (yPos > 700) {
          doc.addPage();
          yPos = 50;
        }

        xPos = 50;
        const rowData = [
          new Date(tx.time).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' }),
          tx.type,
          `KES ${parseFloat(tx.amount).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`,
          tx.paymentMethod || 'Cash',
          tx.member.substring(0, 20),
          tx.status
        ];

        rowData.forEach((data, i) => {
          doc.text(data, xPos, yPos, { width: colWidths[i] });
          xPos += colWidths[i];
        });

        yPos += 20;
        doc.y = yPos;
      });

      // Footer
      doc.moveDown(3);
      doc.fontSize(10);
      doc.text(`Generated on ${new Date().toLocaleString('en-KE')}`, { align: 'center' });
      doc.text('This is a system-generated report', { align: 'center', italics: true });

      doc.end();
    } catch (err) {
      next(err);
    }
  }

  // Get End of Day Report Data (JSON)
  async getEndOfDayReport(req, res, next) {
    try {
      const { date } = req.query;
      const reportDate = date ? new Date(date) : new Date();
      
      const reportData = await tellerService.generateEndOfDayReport(
        req.user.organizationId,
        req.user.id,
        reportDate
      );

      return successResponse(res, { data: reportData });
    } catch (err) {
      next(err);
    }
  }

  // Submit Cash Counting
  async submitCashCounting(req, res, next) {
    try {
      const result = await tellerService.submitCashCounting(
        req.user.organizationId,
        req.user.id,
        req.body
      );
      return createdResponse(res, { 
        message: 'Cash counting submitted successfully', 
        data: result 
      });
    } catch (err) {
      next(err);
    }
  }

  // Review Transaction (Approve/Reject)
  async reviewTransaction(req, res, next) {
    try {
      const { action, notes } = req.body;
      const transaction = await tellerService.reviewTransaction(
        req.params.id,
        req.user.organizationId,
        req.user.id,
        action,
        notes
      );
      return successResponse(res, { 
        message: `Transaction ${action}d successfully`, 
        data: transaction 
      });
    } catch (err) {
      next(err);
    }
  }

  // Get Daily Targets
  async getDailyTargets(req, res, next) {
    try {
      const { date } = req.query;
      const targetDate = date ? new Date(date) : new Date();
      
      const targets = await tellerService.getDailyTargets(
        req.user.organizationId,
        req.user.id,
        targetDate
      );
      return successResponse(res, { data: targets });
    } catch (err) {
      next(err);
    }
  }

  // Get Performance Metrics
  async getPerformanceMetrics(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
      const end = endDate || new Date();
      
      const metrics = await tellerService.getPerformanceMetrics(
        req.user.organizationId,
        req.user.id,
        start,
        end
      );
      return successResponse(res, { data: metrics });
    } catch (err) {
      next(err);
    }
  }
}

export default new TellerController();
