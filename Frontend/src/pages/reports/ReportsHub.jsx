import { useState } from 'react'
import { 
  Users, PiggyBank, HandCoins, Landmark, TrendingUp, Wallet, 
  Lock, ArrowRight, Download, FileSpreadsheet 
} from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import Modal from '../../components/modals/Modal'
import Button from '../../components/common/Button'
import { useAuth } from '../../hooks/useAuth'
import { ROLES } from '../../constants/roles'
import { MEMBERS, LOANS, TRANSACTIONS, BRANCHES, MONTHLY_INCOME } from '../../utils/mockData'
import { formatKES, formatNumber, formatDate, classNames } from '../../utils/format'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { toast } from 'react-toastify'

const ReportsHub = () => {
  const { user } = useAuth()
  const [selectedReport, setSelectedReport] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  // Check if the logged-in user is an Admin
  const isAdmin = user?.role === ROLES.SACCO_ADMIN

  const REPORTS = [
    {
      id: 'members',
      title: 'Member Demographics Report',
      description: 'Detailed analysis of registered members, including statuses, contact details, and branch distributions.',
      icon: Users,
      color: 'teal',
      exportName: 'sacco_members_report',
      columns: [
        { key: 'memberNo', label: 'Member No' },
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        { key: 'branch', label: 'Branch' },
        { key: 'idNumber', label: 'ID Number' },
        { key: 'joinDate', label: 'Join Date' },
        { key: 'status', label: 'Status' }
      ],
      getData: () => MEMBERS
    },
    {
      id: 'savings',
      title: 'Savings & Share Capital Report',
      description: 'Overview of ordinary savings and share capital balances across all registered members.',
      icon: PiggyBank,
      color: 'gold',
      exportName: 'sacco_savings_report',
      columns: [
        { key: 'memberNo', label: 'Member No' },
        { key: 'name', label: 'Name' },
        { key: 'branch', label: 'Branch' },
        { key: 'savings', label: 'Ordinary Savings (KES)', format: (v) => formatKES(v), exportValue: (r) => formatKES(r.savings) },
        { key: 'shareCapital', label: 'Share Capital (KES)', format: (v) => formatKES(v), exportValue: (r) => formatKES(r.shareCapital) }
      ],
      getData: () => MEMBERS
    },
    {
      id: 'loans',
      title: 'Loan Portfolio Report',
      description: 'Comprehensive status of active, pending, approved, and defaulted loans with outstanding balances.',
      icon: HandCoins,
      color: 'info',
      exportName: 'sacco_loans_report',
      columns: [
        { key: 'id', label: 'Loan Ref' },
        { key: 'member', label: 'Member Name' },
        { key: 'branch', label: 'Branch' },
        { key: 'type', label: 'Loan Type' },
        { key: 'principal', label: 'Principal (KES)', format: (v) => formatKES(v), exportValue: (r) => formatKES(r.principal) },
        { key: 'interestRate', label: 'Rate (%)', format: (v) => `${v}%`, exportValue: (r) => `${r.interestRate}%` },
        { key: 'termMonths', label: 'Term (Months)', exportValue: (r) => r.termMonths },
        { key: 'balance', label: 'Outstanding Balance (KES)', format: (v) => formatKES(v), exportValue: (r) => formatKES(r.balance) },
        { key: 'status', label: 'Status' }
      ],
      getData: () => LOANS
    },
    {
      id: 'transactions',
      title: 'Financial Transactions Audit',
      description: 'Consolidated audit trail of all member deposits, withdrawals, transfers, and repayments.',
      icon: Wallet,
      color: 'teal',
      exportName: 'sacco_transactions_report',
      columns: [
        { key: 'id', label: 'Tx Ref' },
        { key: 'member', label: 'Member Name' },
        { key: 'type', label: 'Tx Type' },
        { key: 'amount', label: 'Amount (KES)', format: (v) => formatKES(v), exportValue: (r) => formatKES(r.amount) },
        { key: 'channel', label: 'Channel' },
        { key: 'date', label: 'Date', format: (v) => formatDate(v), exportValue: (r) => formatDate(r.date) },
        { key: 'status', label: 'Status' },
        { key: 'teller', label: 'Teller' }
      ],
      getData: () => TRANSACTIONS
    },
    {
      id: 'branches',
      title: 'Branch Performance Summary',
      description: 'Breakdown of member registration, total savings, active loans, and revenue by branch.',
      icon: Landmark,
      color: 'gold',
      exportName: 'sacco_branches_performance_report',
      columns: [
        { key: 'id', label: 'Branch ID' },
        { key: 'name', label: 'Branch Name' },
        { key: 'manager', label: 'Manager' },
        { key: 'members', label: 'Members Count', format: (v) => formatNumber(v), exportValue: (r) => formatNumber(r.members) },
        { key: 'savings', label: 'Total Savings (KES)', format: (v) => formatKES(v), exportValue: (r) => formatKES(r.savings) },
        { key: 'activeLoans', label: 'Active Loans', format: (v) => formatNumber(v), exportValue: (r) => formatNumber(r.activeLoans) },
        { key: 'revenue', label: 'Revenue (KES)', format: (v) => formatKES(v), exportValue: (r) => formatKES(r.revenue) },
        { key: 'location', label: 'Location' }
      ],
      getData: () => BRANCHES
    },
    {
      id: 'income',
      title: 'Monthly Income & Fees Statement',
      description: 'Overview of monthly interest income, processing fee revenue, and penalty charges.',
      icon: TrendingUp,
      color: 'info',
      exportName: 'sacco_income_report',
      columns: [
        { key: 'month', label: 'Month' },
        { key: 'interest', label: 'Interest Income (M KES)', format: (v) => `${v} M`, exportValue: (r) => `${r.interest} M` },
        { key: 'fees', label: 'Fee Income (M KES)', format: (v) => `${v} M`, exportValue: (r) => `${r.fees} M` }
      ],
      getData: () => MONTHLY_INCOME
    }
  ]

  const handleCardClick = (report) => {
    if (!isAdmin) {
      toast.warning('Access Denied: Only SACCO Administrators can generate this report.')
      return
    }
    setSelectedReport(report)
    setModalOpen(true)
  }

  const exportExcel = (report) => {
    try {
      const data = report.getData()
      const formattedData = data.map(row => {
        const newRow = {}
        report.columns.forEach(col => {
          newRow[col.label] = col.exportValue ? col.exportValue(row) : row[col.key]
        })
        return newRow
      })

      const ws = XLSX.utils.json_to_sheet(formattedData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, report.title.substring(0, 30))
      XLSX.writeFile(wb, `${report.exportName}.xlsx`)
      toast.success(`${report.title} exported to Excel successfully!`)
    } catch (err) {
      toast.error('Failed to export Excel report.')
      console.error(err)
    }
  }

  const exportPdf = (report) => {
    try {
      const doc = new jsPDF()
      const data = report.getData()
      
      // Add report header
      doc.setFontSize(16)
      doc.setTextColor(11, 79, 74)
      doc.text("Amana SACCO — Management System", 14, 20)
      doc.setFontSize(12)
      doc.setTextColor(100)
      doc.text(report.title, 14, 28)
      doc.setFontSize(8)
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 34)
      
      autoTable(doc, {
        startY: 40,
        head: [report.columns.map((c) => c.label)],
        body: data.map((row) => report.columns.map((c) => {
          const val = row[c.key]
          return c.exportValue ? c.exportValue(row) : val
        })),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [11, 79, 74] },
      })
      doc.save(`${report.exportName}.pdf`)
      toast.success(`${report.title} exported to PDF successfully!`)
    } catch (err) {
      toast.error('Failed to export PDF report.')
      console.error(err)
    }
  }

  return (
    <div>
      <PageHeader
        title="Reports Hub"
        subtitle="Generate, preview, and export SACCO reports"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {REPORTS.map((report) => {
          const Icon = report.icon
          return (
            <div
              key={report.id}
              onClick={() => handleCardClick(report)}
              className={classNames(
                "bg-white dark:bg-ink-800 p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between h-full active:scale-[0.99]",
                isAdmin 
                  ? "cursor-pointer hover:-translate-y-1 hover:shadow-card-hover border-ink-100 dark:border-ink-700/60 hover:border-teal-500/50 dark:hover:border-gold-400/50" 
                  : "opacity-60 border-ink-100 dark:border-ink-700 cursor-not-allowed"
              )}
            >
              <div>
                <div className={classNames(
                  "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300",
                  report.color === 'teal' ? 'bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400' :
                  report.color === 'gold' ? 'bg-gold-50 dark:bg-gold-950/30 text-gold-600 dark:text-gold-400' :
                  'bg-info-light dark:bg-info-dark/30 text-info'
                )}>
                  <Icon size={22} className={isAdmin ? "group-hover:scale-115 transition-transform duration-300" : ""} />
                </div>
                <h3 className="font-semibold text-ink-800 dark:text-ink-50 mb-2 flex items-center gap-2">
                  {report.title}
                  {!isAdmin && <Lock size={14} className="text-ink-400" />}
                </h3>
                <p className="text-xs text-ink-400 dark:text-ink-300 leading-relaxed">
                  {report.description}
                </p>
              </div>
              
              <div className="mt-5 flex items-center justify-between">
                <span className={classNames(
                  "text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full",
                  isAdmin 
                    ? "bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400" 
                    : "bg-ink-100 dark:bg-ink-700 text-ink-400 dark:text-ink-400"
                )}>
                  {isAdmin ? 'Available' : 'Admin Only'}
                </span>
                {isAdmin && (
                  <span className="text-xs font-medium text-teal-600 dark:text-gold-400 hover:underline flex items-center gap-1">
                    Generate <ArrowRight size={12} />
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {selectedReport && (
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={`Generate: ${selectedReport.title}`}
          footer={
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                variant="outline" 
                icon={FileSpreadsheet} 
                onClick={() => { exportExcel(selectedReport); setModalOpen(false); }}
                className="flex-1 sm:flex-initial"
              >
                Export Excel
              </Button>
              <Button 
                variant="primary" 
                icon={Download} 
                onClick={() => { exportPdf(selectedReport); setModalOpen(false); }}
                className="flex-1 sm:flex-initial"
              >
                Export PDF
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <p className="text-sm text-ink-500 dark:text-ink-300">
              {selectedReport.description}
            </p>

            <div className="bg-ink-50 dark:bg-ink-700/30 p-3.5 rounded-xl border border-ink-100 dark:border-ink-700">
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">
                Report Schema ({selectedReport.columns.length} Columns)
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedReport.columns.map((col) => (
                  <span key={col.key} className="text-xs font-mono px-2 py-1 bg-white dark:bg-ink-800 text-ink-600 dark:text-ink-300 rounded border border-ink-100 dark:border-ink-700">
                    {col.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="text-xs text-ink-400">
              This report will contain the full dataset of <strong>{selectedReport.getData().length} records</strong>. Select a format below to download.
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default ReportsHub
