import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ArrowLeft } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import Badge from '../../components/common/Badge'
import DataTable from '../../components/tables/DataTable'
import EmptyState from '../../components/common/EmptyState'
import { formatKES, formatDate } from '../../utils/format'

const buildSchedule = (loan) => {
  const n = loan.termMonths
  const rate = loan.interestRate / 100 / 12
  const principal = loan.principal
  const emi = rate ? (principal * rate * Math.pow(1 + rate, n)) / (Math.pow(1 + rate, n) - 1) : principal / n
  let balance = principal
  const rows = []
  const start = new Date(loan.applicationDate)
  for (let i = 1; i <= n; i += 1) {
    const interest = balance * rate
    const principalPortion = emi - interest
    balance = Math.max(0, balance - principalPortion)
    const due = new Date(start)
    due.setMonth(due.getMonth() + i)
    rows.push({
      id: `${loan.id}-${i}`,
      installment: i,
      dueDate: due.toISOString().slice(0, 10),
      emi,
      principalPortion,
      interest,
      balance,
      status: i <= n * 0.3 ? 'Completed' : i <= n * 0.4 ? 'Pending' : 'Pending',
    })
  }
  return rows
}

const LoanDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { list } = useSelector((s) => s.loans)
  const loan = list.find((l) => l.id === id)

  if (!loan) return <EmptyState title="Loan not found" />

  const schedule = buildSchedule(loan)

  const cols = [
    { key: 'installment', label: '#' },
    { key: 'dueDate', label: 'Due Date', render: (r) => formatDate(r.dueDate) },
    { key: 'emi', label: 'Installment', render: (r) => formatKES(r.emi) },
    { key: 'principalPortion', label: 'Principal', render: (r) => formatKES(r.principalPortion) },
    { key: 'interest', label: 'Interest', render: (r) => formatKES(r.interest) },
    { key: 'balance', label: 'Balance', render: (r) => formatKES(r.balance) },
    { key: 'status', label: 'Status', render: (r) => <Badge>{r.status}</Badge> },
  ]

  return (
    <div>
      <button onClick={() => navigate('/loans')} className="flex items-center gap-1.5 text-sm text-ink-500 dark:text-ink-300 hover:text-teal-600 mb-4">
        <ArrowLeft size={15} /> Back to loans
      </button>
      <PageHeader title={`Loan ${loan.id}`} subtitle={`${loan.member} · ${loan.type}`} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-ink-800 rounded-2xl p-5 shadow-card border border-ink-50 dark:border-ink-700">
          <p className="text-xs text-ink-400 uppercase font-medium">Principal</p>
          <p className="text-xl font-display font-bold text-ink-800 dark:text-ink-50 mt-1.5">{formatKES(loan.principal)}</p>
        </div>
        <div className="bg-white dark:bg-ink-800 rounded-2xl p-5 shadow-card border border-ink-50 dark:border-ink-700">
          <p className="text-xs text-ink-400 uppercase font-medium">Balance</p>
          <p className="text-xl font-display font-bold text-ink-800 dark:text-ink-50 mt-1.5">{formatKES(loan.balance)}</p>
        </div>
        <div className="bg-white dark:bg-ink-800 rounded-2xl p-5 shadow-card border border-ink-50 dark:border-ink-700">
          <p className="text-xs text-ink-400 uppercase font-medium">Interest Rate</p>
          <p className="text-xl font-display font-bold text-ink-800 dark:text-ink-50 mt-1.5">{loan.interestRate}%</p>
        </div>
        <div className="bg-white dark:bg-ink-800 rounded-2xl p-5 shadow-card border border-ink-50 dark:border-ink-700">
          <p className="text-xs text-ink-400 uppercase font-medium">Status</p>
          <div className="mt-2"><Badge>{loan.status}</Badge></div>
        </div>
      </div>

      <h3 className="font-semibold text-ink-800 dark:text-ink-50 mb-3">Repayment Schedule</h3>
      <DataTable columns={cols} data={schedule} title={`${loan.id}-schedule`} pageSize={6} />
    </div>
  )
}

export default LoanDetail
