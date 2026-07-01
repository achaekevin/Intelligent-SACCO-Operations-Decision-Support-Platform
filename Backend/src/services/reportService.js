import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { Op } from 'sequelize';
import { Member, SavingsAccount, SavingsTransaction, Loan, LoanRepayment } from '../models/index.js';
import logger from '../utils/logger.js';

class ReportService {
  // ─── Helpers ─────────────────────────────────────────────────────
  _dateRange(query) {
    const where = {};
    if (query.startDate) where[Op.gte] = new Date(query.startDate);
    if (query.endDate)   where[Op.lte] = new Date(query.endDate);
    return Object.keys(where).length ? { createdAt: where } : {};
  }

  _formatKES(amount) {
    return `KES ${parseFloat(amount || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
  }

  // ─── Members Report ───────────────────────────────────────────────
  async getMembersData(organizationId, query = {}) {
    const where = { organizationId, ...this._dateRange(query) };
    if (query.status)   where.status   = query.status;
    if (query.branchId) where.branchId = query.branchId;

    return Member.findAll({
      where,
      order: [['memberNumber', 'ASC']],
      attributes: ['memberNumber', 'firstName', 'lastName', 'phone', 'email', 'nationalId', 'status', 'loyaltyTier', 'joiningDate', 'county', 'occupation'],
    });
  }

  // ─── Savings Report ────────────────────────────────────────────────
  async getSavingsData(organizationId, query = {}) {
    const where = { organizationId };
    if (query.accountType) where.accountType = query.accountType;
    if (query.status)      where.status      = query.status;
    if (query.branchId)    where.branchId    = query.branchId;

    return SavingsAccount.findAll({
      where,
      include: [{ model: Member, as: 'member', attributes: ['memberNumber', 'firstName', 'lastName', 'phone'] }],
      order: [['accountNumber', 'ASC']],
    });
  }

  // ─── Loans Report ──────────────────────────────────────────────────
  async getLoansData(organizationId, query = {}) {
    const where = { organizationId, ...this._dateRange(query) };
    if (query.status)   where.status   = query.status;
    if (query.branchId) where.branchId = query.branchId;

    return Loan.findAll({
      where,
      include: [{ model: Member, as: 'member', attributes: ['memberNumber', 'firstName', 'lastName', 'phone'] }],
      order: [['applicationDate', 'DESC']],
    });
  }

  // ─── CSV Export ───────────────────────────────────────────────────
  async generateCSV(rows, columns) {
    const header = columns.map((c) => c.label).join(',');
    const dataRows = rows.map((row) =>
      columns.map((c) => {
        const val = typeof c.key === 'function' ? c.key(row) : (row[c.key] ?? '');
        const str = String(val).replace(/"/g, '""');
        return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str}"` : str;
      }).join(',')
    );
    return [header, ...dataRows].join('\n');
  }

  async membersCSV(organizationId, query) {
    const members = await this.getMembersData(organizationId, query);
    return this.generateCSV(members, [
      { label: 'Member No',    key: 'memberNumber' },
      { label: 'First Name',   key: 'firstName' },
      { label: 'Last Name',    key: 'lastName' },
      { label: 'Phone',        key: 'phone' },
      { label: 'Email',        key: (r) => r.email || '' },
      { label: 'National ID',  key: 'nationalId' },
      { label: 'Status',       key: 'status' },
      { label: 'Loyalty Tier', key: 'loyaltyTier' },
      { label: 'Joined',       key: (r) => r.joiningDate || '' },
    ]);
  }

  async savingsCSV(organizationId, query) {
    const accounts = await this.getSavingsData(organizationId, query);
    return this.generateCSV(accounts, [
      { label: 'Account No',   key: 'accountNumber' },
      { label: 'Member No',    key: (r) => r.member?.memberNumber || '' },
      { label: 'Member Name',  key: (r) => `${r.member?.firstName || ''} ${r.member?.lastName || ''}`.trim() },
      { label: 'Phone',        key: (r) => r.member?.phone || '' },
      { label: 'Type',         key: 'accountType' },
      { label: 'Balance',      key: (r) => parseFloat(r.balance || 0).toFixed(2) },
      { label: 'Interest Rate',key: (r) => `${r.interestRate}%` },
      { label: 'Status',       key: 'status' },
    ]);
  }

  async loansCSV(organizationId, query) {
    const loans = await this.getLoansData(organizationId, query);
    return this.generateCSV(loans, [
      { label: 'Loan No',       key: 'loanNumber' },
      { label: 'Member No',     key: (r) => r.member?.memberNumber || '' },
      { label: 'Member Name',   key: (r) => `${r.member?.firstName || ''} ${r.member?.lastName || ''}`.trim() },
      { label: 'Type',          key: 'type' },
      { label: 'Principal',     key: (r) => parseFloat(r.principalAmount || 0).toFixed(2) },
      { label: 'Balance',       key: (r) => parseFloat(r.principalBalance || 0).toFixed(2) },
      { label: 'Rate %',        key: (r) => `${r.interestRate}%` },
      { label: 'Term (months)', key: 'termMonths' },
      { label: 'Status',        key: 'status' },
      { label: 'Applied',       key: 'applicationDate' },
    ]);
  }

  // ─── Excel Export ─────────────────────────────────────────────────
  async membersExcel(organizationId, query) {
    const members = await this.getMembersData(organizationId, query);
    const wb = new ExcelJS.Workbook();
    wb.creator = 'SACCO Management System';
    const ws = wb.addWorksheet('Members');

    ws.columns = [
      { header: 'Member No',   key: 'memberNumber', width: 16 },
      { header: 'First Name',  key: 'firstName',    width: 18 },
      { header: 'Last Name',   key: 'lastName',     width: 18 },
      { header: 'Phone',       key: 'phone',        width: 18 },
      { header: 'Email',       key: 'email',        width: 28 },
      { header: 'National ID', key: 'nationalId',   width: 16 },
      { header: 'Status',      key: 'status',       width: 12 },
      { header: 'Loyalty',     key: 'loyaltyTier',  width: 12 },
      { header: 'County',      key: 'county',       width: 16 },
      { header: 'Occupation',  key: 'occupation',   width: 20 },
      { header: 'Joined',      key: 'joiningDate',  width: 14 },
    ];

    // Style header
    ws.getRow(1).eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF16A34A' } };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });
    ws.getRow(1).height = 22;

    members.forEach((m) => ws.addRow(m.toJSON()));

    // Alternate row colors
    ws.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      row.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowNumber % 2 === 0 ? 'FFF0FDF4' : 'FFFFFFFF' } };
      });
    });

    return wb.xlsx.writeBuffer();
  }

  async loansExcel(organizationId, query) {
    const loans = await this.getLoansData(organizationId, query);
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Loans');

    ws.columns = [
      { header: 'Loan No',       key: 'loanNumber',      width: 18 },
      { header: 'Member No',     key: 'memberNumber',     width: 16 },
      { header: 'Member Name',   key: 'memberName',       width: 24 },
      { header: 'Type',          key: 'type',             width: 18 },
      { header: 'Principal',     key: 'principalAmount',  width: 16, style: { numFmt: '#,##0.00' } },
      { header: 'Balance',       key: 'principalBalance', width: 16, style: { numFmt: '#,##0.00' } },
      { header: 'Rate %',        key: 'interestRate',     width: 10 },
      { header: 'Term (mo)',     key: 'termMonths',       width: 12 },
      { header: 'Monthly EMI',   key: 'monthlyInstallment', width: 16, style: { numFmt: '#,##0.00' } },
      { header: 'Status',        key: 'status',           width: 14 },
      { header: 'Applied',       key: 'applicationDate',  width: 14 },
    ];

    ws.getRow(1).eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E40AF' } };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    });

    loans.forEach((l) => ws.addRow({
      loanNumber: l.loanNumber,
      memberNumber: l.member?.memberNumber,
      memberName: `${l.member?.firstName || ''} ${l.member?.lastName || ''}`.trim(),
      type: l.type,
      principalAmount: parseFloat(l.principalAmount),
      principalBalance: parseFloat(l.principalBalance),
      interestRate: l.interestRate,
      termMonths: l.termMonths,
      monthlyInstallment: parseFloat(l.monthlyInstallment),
      status: l.status,
      applicationDate: l.applicationDate,
    }));

    return wb.xlsx.writeBuffer();
  }

  // ─── PDF Export ───────────────────────────────────────────────────
  async membersPDF(organizationId, query) {
    return new Promise(async (resolve, reject) => {
      try {
        const members = await this.getMembersData(organizationId, query);
        const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
        const buffers = [];
        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        // Title
        doc.fontSize(16).fillColor('#16a34a').text('SACCO Members Report', { align: 'center' });
        doc.fontSize(10).fillColor('#6b7280').text(`Generated: ${new Date().toLocaleString('en-KE')}`, { align: 'center' });
        doc.moveDown();

        // Table header
        const colX = [40, 120, 200, 280, 380, 460, 540, 620];
        const headers = ['Member No', 'First Name', 'Last Name', 'Phone', 'Email', 'Status', 'Tier', 'Joined'];

        doc.rect(40, doc.y, 760, 20).fill('#16a34a');
        doc.fillColor('#ffffff').fontSize(9);
        headers.forEach((h, i) => doc.text(h, colX[i], doc.y - 16, { width: colX[i + 1] ? colX[i + 1] - colX[i] - 5 : 100 }));
        doc.moveDown(0.5);

        // Table rows
        members.forEach((m, idx) => {
          const y = doc.y;
          if (idx % 2 === 0) doc.rect(40, y, 760, 18).fill('#f0fdf4');
          doc.fillColor('#1f2937').fontSize(8);
          const row = [m.memberNumber, m.firstName, m.lastName, m.phone, m.email || '', m.status, m.loyaltyTier, m.joiningDate];
          row.forEach((val, i) => doc.text(String(val || ''), colX[i], y + 4, { width: colX[i + 1] ? colX[i + 1] - colX[i] - 5 : 100 }));
          doc.moveDown(0.8);

          if (doc.y > 540) {
            doc.addPage({ layout: 'landscape' });
            doc.rect(40, doc.y, 760, 20).fill('#16a34a');
            doc.fillColor('#ffffff').fontSize(9);
            headers.forEach((h, i) => doc.text(h, colX[i], doc.y - 16, { width: 90 }));
            doc.moveDown(0.5);
          }
        });

        doc.fontSize(8).fillColor('#9ca3af').text(`Total: ${members.length} members`, 40, doc.y + 10);
        doc.end();
      } catch (err) { reject(err); }
    });
  }

  async loansPDF(organizationId, query) {
    return new Promise(async (resolve, reject) => {
      try {
        const loans = await this.getLoansData(organizationId, query);
        const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
        const buffers = [];
        doc.on('data', (c) => buffers.push(c));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        doc.fontSize(16).fillColor('#1e40af').text('Loans Report', { align: 'center' });
        doc.fontSize(10).fillColor('#6b7280').text(`Generated: ${new Date().toLocaleString('en-KE')}`, { align: 'center' });
        doc.moveDown();

        const colX = [40, 120, 220, 320, 400, 490, 570, 650];
        const headers = ['Loan No', 'Member No', 'Member Name', 'Type', 'Principal', 'Balance', 'Rate', 'Status'];

        doc.rect(40, doc.y, 760, 20).fill('#1e40af');
        doc.fillColor('#ffffff').fontSize(9);
        headers.forEach((h, i) => doc.text(h, colX[i], doc.y - 16, { width: 90 }));
        doc.moveDown(0.5);

        loans.forEach((l, idx) => {
          const y = doc.y;
          if (idx % 2 === 0) doc.rect(40, y, 760, 18).fill('#eff6ff');
          doc.fillColor('#1f2937').fontSize(8);
          const row = [
            l.loanNumber,
            l.member?.memberNumber || '',
            `${l.member?.firstName || ''} ${l.member?.lastName || ''}`.trim(),
            l.type,
            this._formatKES(l.principalAmount),
            this._formatKES(l.principalBalance),
            `${l.interestRate}%`,
            l.status,
          ];
          row.forEach((val, i) => doc.text(String(val || ''), colX[i], y + 4, { width: 80 }));
          doc.moveDown(0.8);
        });

        doc.fontSize(8).fillColor('#9ca3af').text(`Total: ${loans.length} loans`, 40, doc.y + 10);
        doc.end();
      } catch (err) { reject(err); }
    });
  }

  // ─── Member Statement ─────────────────────────────────────────────
  async getMemberStatement(memberId, organizationId, query = {}) {
    const member = await Member.findOne({ where: { id: memberId, organizationId } });
    if (!member) throw new Error('Member not found');

    const dateWhere = {};
    if (query.startDate) dateWhere.createdAt = { [Op.gte]: new Date(query.startDate) };
    if (query.endDate) dateWhere.createdAt = { ...dateWhere.createdAt, [Op.lte]: new Date(query.endDate) };

    const [savingsAccounts, transactions, loans] = await Promise.all([
      SavingsAccount.findAll({ where: { memberId, organizationId } }),
      SavingsTransaction.findAll({ 
        where: { memberId, organizationId, ...dateWhere },
        order: [['createdAt', 'DESC']],
        limit: 100
      }),
      Loan.findAll({ 
        where: { memberId, organizationId },
        include: [{ model: LoanRepayment, as: 'repayments', limit: 5, order: [['dueDate', 'DESC']] }]
      }),
    ]);

    return { member, savingsAccounts, transactions, loans };
  }

  async memberStatementPDF(memberId, organizationId, query) {
    return new Promise(async (resolve, reject) => {
      try {
        const { member, savingsAccounts, transactions, loans } = await this.getMemberStatement(memberId, organizationId, query);
        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        const buffers = [];
        doc.on('data', (c) => buffers.push(c));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        // Header
        doc.fontSize(18).fillColor('#16a34a').text('Amana SACCO', { align: 'center' });
        doc.fontSize(14).fillColor('#374151').text('Member Statement', { align: 'center' });
        doc.moveDown();

        // Member Info
        doc.fontSize(10).fillColor('#6b7280');
        doc.text(`Member: ${member.firstName} ${member.lastName}`, 40);
        doc.text(`Member No: ${member.memberNumber}`);
        doc.text(`Phone: ${member.phone}`);
        doc.text(`Email: ${member.email || 'N/A'}`);
        doc.text(`Statement Date: ${new Date().toLocaleDateString('en-KE')}`);
        doc.moveDown();

        // Savings Summary
        doc.fontSize(12).fillColor('#16a34a').text('Savings Summary', { underline: true });
        doc.moveDown(0.5);
        savingsAccounts.forEach(acc => {
          doc.fontSize(10).fillColor('#374151').text(`${acc.accountType}: ${this._formatKES(acc.balance)}`, { indent: 20 });
        });
        doc.moveDown();

        // Loans Summary
        doc.fontSize(12).fillColor('#1e40af').text('Loans Summary', { underline: true });
        doc.moveDown(0.5);
        if (loans.length > 0) {
          loans.forEach(loan => {
            doc.fontSize(10).fillColor('#374151').text(
              `${loan.loanNumber}: ${this._formatKES(loan.principalBalance)} remaining (Status: ${loan.status})`,
              { indent: 20 }
            );
          });
        } else {
          doc.fontSize(10).fillColor('#6b7280').text('No active loans', { indent: 20 });
        }
        doc.moveDown();

        // Recent Transactions
        doc.fontSize(12).fillColor('#7c3aed').text('Recent Transactions', { underline: true });
        doc.moveDown(0.5);
        if (transactions.length > 0) {
          transactions.slice(0, 20).forEach(txn => {
            const amount = txn.type === 'deposit' ? `+${this._formatKES(txn.amount)}` : `-${this._formatKES(txn.amount)}`;
            const color = txn.type === 'deposit' ? '#16a34a' : '#dc2626';
            doc.fontSize(9).fillColor('#374151').text(
              `${new Date(txn.createdAt).toLocaleDateString('en-KE')} - ${txn.type} - `,
              { continued: true, indent: 20 }
            );
            doc.fillColor(color).text(amount);
          });
        } else {
          doc.fontSize(10).fillColor('#6b7280').text('No transactions in selected period', { indent: 20 });
        }

        doc.end();
      } catch (err) { reject(err); }
    });
  }

  // ─── Transaction Reports ──────────────────────────────────────────
  async getTransactionsData(organizationId, query = {}) {
    const where = { organizationId };
    if (query.type) where.type = query.type;
    if (query.startDate) where.createdAt = { [Op.gte]: new Date(query.startDate) };
    if (query.endDate) where.createdAt = { ...where.createdAt, [Op.lte]: new Date(query.endDate) };

    return SavingsTransaction.findAll({
      where,
      include: [
        { model: Member, as: 'member', attributes: ['memberNumber', 'firstName', 'lastName', 'phone'] },
        { model: SavingsAccount, as: 'account', attributes: ['accountNumber', 'accountType'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: query.limit || 1000
    });
  }

  async transactionsCSV(organizationId, query) {
    const transactions = await this.getTransactionsData(organizationId, query);
    return this.generateCSV(transactions, [
      { label: 'Reference',     key: 'reference' },
      { label: 'Date',          key: (r) => new Date(r.createdAt).toLocaleDateString('en-KE') },
      { label: 'Member No',     key: (r) => r.member?.memberNumber || '' },
      { label: 'Member Name',   key: (r) => `${r.member?.firstName || ''} ${r.member?.lastName || ''}`.trim() },
      { label: 'Account No',    key: (r) => r.account?.accountNumber || '' },
      { label: 'Type',          key: 'type' },
      { label: 'Amount',        key: (r) => parseFloat(r.amount || 0).toFixed(2) },
      { label: 'Balance After', key: (r) => parseFloat(r.balanceAfter || 0).toFixed(2) },
      { label: 'Method',        key: 'paymentMethod' },
      { label: 'Status',        key: 'status' },
    ]);
  }

  // ─── Financial Reports ─────────────────────────────────────────────
  async getFinancialReport(organizationId, query = {}) {
    const startDate = query.startDate ? new Date(query.startDate) : new Date(new Date().getFullYear(), 0, 1);
    const endDate = query.endDate ? new Date(query.endDate) : new Date();

    const dateFilter = { createdAt: { [Op.between]: [startDate, endDate] } };

    // Total Deposits
    const [[depositsResult]] = await SavingsTransaction.sequelize.query(
      `SELECT SUM(amount) as total FROM savings_transactions 
       WHERE organizationId = ? AND type = 'deposit' AND status = 'completed' 
       AND createdAt BETWEEN ? AND ? AND deletedAt IS NULL`,
      { replacements: [organizationId, startDate, endDate] }
    );

    // Total Withdrawals
    const [[withdrawalsResult]] = await SavingsTransaction.sequelize.query(
      `SELECT SUM(amount) as total FROM savings_transactions 
       WHERE organizationId = ? AND type = 'withdrawal' AND status = 'completed' 
       AND createdAt BETWEEN ? AND ? AND deletedAt IS NULL`,
      { replacements: [organizationId, startDate, endDate] }
    );

    // Loans Disbursed
    const [[loansDisbursedResult]] = await Loan.sequelize.query(
      `SELECT SUM(principalAmount) as total, COUNT(*) as count FROM loans 
       WHERE organizationId = ? AND status = 'disbursed' 
       AND disbursedAt BETWEEN ? AND ? AND deletedAt IS NULL`,
      { replacements: [organizationId, startDate, endDate] }
    );

    // Loan Repayments
    const [[repaymentsResult]] = await LoanRepayment.sequelize.query(
      `SELECT SUM(amountPaid) as total FROM loan_repayments 
       WHERE organizationId = ? AND status IN ('paid', 'partial') 
       AND paymentDate BETWEEN ? AND ? AND deletedAt IS NULL`,
      { replacements: [organizationId, startDate, endDate] }
    );

    // Active Members
    const activeMembersCount = await Member.count({ 
      where: { organizationId, status: 'active' } 
    });

    // Total Savings Balance
    const [[savingsBalanceResult]] = await SavingsAccount.sequelize.query(
      `SELECT SUM(balance) as total FROM savings_accounts 
       WHERE organizationId = ? AND status = 'active' AND deletedAt IS NULL`,
      { replacements: [organizationId] }
    );

    // Outstanding Loans
    const [[outstandingLoansResult]] = await Loan.sequelize.query(
      `SELECT SUM(principalBalance) as total, COUNT(*) as count FROM loans 
       WHERE organizationId = ? AND status = 'disbursed' AND deletedAt IS NULL`,
      { replacements: [organizationId] }
    );

    return {
      period: { startDate, endDate },
      deposits: {
        total: parseFloat(depositsResult?.total || 0),
        description: 'Total deposits received'
      },
      withdrawals: {
        total: parseFloat(withdrawalsResult?.total || 0),
        description: 'Total withdrawals processed'
      },
      netSavingsFlow: {
        total: parseFloat(depositsResult?.total || 0) - parseFloat(withdrawalsResult?.total || 0),
        description: 'Net savings flow (deposits - withdrawals)'
      },
      loansDisbursed: {
        total: parseFloat(loansDisbursedResult?.total || 0),
        count: parseInt(loansDisbursedResult?.count || 0),
        description: 'Loans disbursed in period'
      },
      loanRepayments: {
        total: parseFloat(repaymentsResult?.total || 0),
        description: 'Loan repayments received'
      },
      activeMembersCount,
      totalSavingsBalance: parseFloat(savingsBalanceResult?.total || 0),
      outstandingLoans: {
        total: parseFloat(outstandingLoansResult?.total || 0),
        count: parseInt(outstandingLoansResult?.count || 0),
        description: 'Total outstanding loan principal'
      },
      generatedAt: new Date()
    };
  }
}

export default new ReportService();
