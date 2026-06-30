import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import DataTable from '../../components/tables/DataTable'
import Button from '../../components/common/Button'
import { BRANCHES } from '../../utils/mockData'
import { formatKES, formatNumber } from '../../utils/format'

const BranchList = () => {
  const navigate = useNavigate()

  const columns = [
    { key: 'name', label: 'Branch' },
    { key: 'manager', label: 'Manager' },
    { key: 'members', label: 'Members', render: (r) => formatNumber(r.members) },
    { key: 'savings', label: 'Total Savings', render: (r) => formatKES(r.savings) },
    { key: 'activeLoans', label: 'Active Loans', render: (r) => formatNumber(r.activeLoans) },
    { key: 'revenue', label: 'Revenue', render: (r) => formatKES(r.revenue) },
    {
      key: 'actions',
      label: '',
      sortable: false,
      render: (r) => (
        <button onClick={() => navigate(`/branches/${r.id}`)} className="text-teal-600 dark:text-gold-400 text-xs font-semibold hover:underline">
          View
        </button>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Branches"
        subtitle={`${BRANCHES.length} branches nationwide`}
        actions={<Button icon={Plus} onClick={() => navigate('/branches/create')}>Create Branch</Button>}
      />
      <DataTable columns={columns} data={BRANCHES} title="branches" exportable />
    </div>
  )
}

export default BranchList
