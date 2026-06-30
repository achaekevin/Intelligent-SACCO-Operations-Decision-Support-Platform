import PageHeader from '../../components/common/PageHeader'
import DataTable from '../../components/tables/DataTable'
import Badge from '../../components/common/Badge'
import { useAuth } from '../../hooks/useAuth'
import { MEMBERS, TRANSACTIONS } from '../../utils/mockData'
import { formatKES, formatDate } from '../../utils/format'

const MemberTransactions = () => {
  const { user } = useAuth()
  const member = MEMBERS.find((m) => m.memberNo === user?.memberNo) || MEMBERS[0]
  const myTx = TRANSACTIONS.filter((t) => t.memberNo === member.memberNo)

  const cols = [
    { key: 'id', label: 'Ref' },
    { key: 'type', label: 'Type' },
    { key: 'amount', label: 'Amount', render: (r) => formatKES(r.amount) },
    { key: 'channel', label: 'Channel' },
    { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
    { key: 'status', label: 'Status', render: (r) => <Badge>{r.status}</Badge> },
  ]

  return (
    <div>
      <PageHeader title="Transaction History" subtitle="All your deposits, withdrawals, and repayments" />
      <DataTable columns={cols} data={myTx} title="my-transaction-history" />
    </div>
  )
}

export default MemberTransactions
