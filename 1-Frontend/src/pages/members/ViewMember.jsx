import { useParams, useNavigate, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ArrowLeft, Pencil, Phone, Mail, MapPin, Calendar, FileDown } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import DataTable from '../../components/tables/DataTable'
import EmptyState from '../../components/common/EmptyState'
import { formatKES, formatDate, initials } from '../../utils/format'
import { LOANS, TRANSACTIONS } from '../../utils/mockData'

const ViewMember = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { list } = useSelector((s) => s.members)
  const member = list.find((m) => m.id === id)

  if (!member) {
    return <EmptyState title="Member not found" description="This member may have been removed." />
  }

  const memberLoans = LOANS.filter((l) => l.memberNo === member.memberNo)
  const memberTx = TRANSACTIONS.filter((t) => t.memberNo === member.memberNo)

  const loanCols = [
    { key: 'id', label: 'Loan ID' },
    { key: 'type', label: 'Type' },
    { key: 'principal', label: 'Principal', render: (r) => formatKES(r.principal) },
    { key: 'balance', label: 'Balance', render: (r) => formatKES(r.balance) },
    { key: 'status', label: 'Status', render: (r) => <Badge>{r.status}</Badge> },
  ]
  const txCols = [
    { key: 'id', label: 'Ref' },
    { key: 'type', label: 'Type' },
    { key: 'amount', label: 'Amount', render: (r) => formatKES(r.amount) },
    { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
    { key: 'status', label: 'Status', render: (r) => <Badge>{r.status}</Badge> },
  ]

  return (
    <div>
      <button onClick={() => navigate('/members')} className="flex items-center gap-1.5 text-sm text-ink-500 dark:text-ink-300 hover:text-teal-600 mb-4">
        <ArrowLeft size={15} /> Back to members
      </button>

      <PageHeader
        title={member.name}
        subtitle={`${member.memberNo} · ${member.branch}`}
        actions={
          <>
            <Button variant="outline" icon={FileDown}>Statement</Button>
            <Button icon={Pencil} onClick={() => navigate(`/members/${id}/edit`)}>Edit</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-ink-800 rounded-2xl p-6 shadow-card border border-ink-50 dark:border-ink-700 lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-teal-600 text-white flex items-center justify-center text-2xl font-semibold mb-3">
              {initials(member.name)}
            </div>
            <h3 className="font-semibold text-ink-800 dark:text-ink-50">{member.name}</h3>
            <Badge>{member.status}</Badge>
          </div>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex items-center gap-2 text-ink-500 dark:text-ink-300"><Mail size={15} /> {member.email}</div>
            <div className="flex items-center gap-2 text-ink-500 dark:text-ink-300"><Phone size={15} /> {member.phone}</div>
            <div className="flex items-center gap-2 text-ink-500 dark:text-ink-300"><MapPin size={15} /> {member.branch}</div>
            <div className="flex items-center gap-2 text-ink-500 dark:text-ink-300"><Calendar size={15} /> Joined {formatDate(member.joinDate)}</div>
          </div>
          <hr className="my-4 border-ink-100 dark:border-ink-700" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-ink-400">ID Number</span><span className="font-medium text-ink-700 dark:text-ink-100">{member.idNumber}</span></div>
            <div className="flex justify-between"><span className="text-ink-400">Next of Kin</span><span className="font-medium text-ink-700 dark:text-ink-100">{member.nextOfKin}</span></div>
            <div className="flex justify-between"><span className="text-ink-400">Beneficiary</span><span className="font-medium text-ink-700 dark:text-ink-100">{member.beneficiary}</span></div>
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-2 gap-4 content-start">
          <div className="bg-white dark:bg-ink-800 rounded-2xl p-5 shadow-card border border-ink-50 dark:border-ink-700">
            <p className="text-xs text-ink-400 uppercase tracking-wide font-medium">Savings Balance</p>
            <p className="text-2xl font-display font-bold text-ink-800 dark:text-ink-50 mt-2">{formatKES(member.savings)}</p>
          </div>
          <div className="bg-white dark:bg-ink-800 rounded-2xl p-5 shadow-card border border-ink-50 dark:border-ink-700">
            <p className="text-xs text-ink-400 uppercase tracking-wide font-medium">Share Capital</p>
            <p className="text-2xl font-display font-bold text-ink-800 dark:text-ink-50 mt-2">{formatKES(member.shareCapital)}</p>
          </div>
          <div className="bg-white dark:bg-ink-800 rounded-2xl p-5 shadow-card border border-ink-50 dark:border-ink-700 col-span-2">
            <p className="text-xs text-ink-400 uppercase tracking-wide font-medium">Active Loans</p>
            <p className="text-2xl font-display font-bold text-ink-800 dark:text-ink-50 mt-2">{member.activeLoans}</p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold text-ink-800 dark:text-ink-50 mb-3">Loan History</h3>
        <DataTable columns={loanCols} data={memberLoans} title="member-loans" exportable={false} pageSize={5} />
      </div>

      <div>
        <h3 className="font-semibold text-ink-800 dark:text-ink-50 mb-3">Transaction History</h3>
        <DataTable columns={txCols} data={memberTx} title="member-transactions" exportable={false} pageSize={5} />
      </div>
    </div>
  )
}

export default ViewMember
