import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { UserPlus } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import DataTable from '../../components/tables/DataTable'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import { formatKES, initials } from '../../utils/format'

const MemberList = () => {
  const navigate = useNavigate()
  const { list } = useSelector((s) => s.members)

  const columns = [
    {
      key: 'name',
      label: 'Member',
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-semibold shrink-0">
            {initials(r.name)}
          </div>
          <div>
            <p className="font-medium text-ink-800 dark:text-ink-50 leading-tight">{r.name}</p>
            <p className="text-xs text-ink-400 leading-tight">{r.memberNo}</p>
          </div>
        </div>
      ),
    },
    { key: 'branch', label: 'Branch' },
    { key: 'phone', label: 'Phone' },
    { key: 'savings', label: 'Savings', render: (r) => formatKES(r.savings) },
    { key: 'activeLoans', label: 'Active Loans' },
    { key: 'status', label: 'Status', render: (r) => <Badge>{r.status}</Badge> },
    {
      key: 'actions',
      label: '',
      sortable: false,
      render: (r) => (
        <button
          onClick={() => navigate(`/members/${r.id}`)}
          className="text-teal-600 dark:text-gold-400 text-xs font-semibold hover:underline"
        >
          View
        </button>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Members"
        subtitle={`${list.length} registered members across all branches`}
        actions={<Button icon={UserPlus} onClick={() => navigate('/members/register')}>Register Member</Button>}
      />
      <DataTable columns={columns} data={list} title="members" />
    </div>
  )
}

export default MemberList
