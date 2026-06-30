import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import DataTable from '../../components/tables/DataTable'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import { useAuth } from '../../hooks/useAuth'
import { MEMBERS, LOANS } from '../../utils/mockData'
import { formatKES, formatDate } from '../../utils/format'

const MemberLoans = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const member = MEMBERS.find((m) => m.memberNo === user?.memberNo) || MEMBERS[0]
  const myLoans = LOANS.filter((l) => l.memberNo === member.memberNo)

  const cols = [
    { key: 'id', label: 'Loan ID' },
    { key: 'type', label: 'Type' },
    { key: 'principal', label: 'Principal', render: (r) => formatKES(r.principal) },
    { key: 'balance', label: 'Balance', render: (r) => formatKES(r.balance) },
    { key: 'applicationDate', label: 'Applied', render: (r) => formatDate(r.applicationDate) },
    { key: 'status', label: 'Status', render: (r) => <Badge>{r.status}</Badge> },
  ]

  return (
    <div>
      <PageHeader
        title="My Loans"
        subtitle="Apply for loans and track repayment"
        actions={<Button icon={Plus} onClick={() => navigate('/loans/apply')}>Apply for a Loan</Button>}
      />
      <DataTable columns={cols} data={myLoans} title="my-loans" exportable={false} />
    </div>
  )
}

export default MemberLoans
