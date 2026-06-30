import PageHeader from '../../components/common/PageHeader'
import DataTable from '../../components/tables/DataTable'
import StatCard from '../../components/cards/StatCard'
import { PiggyBank, Coins } from 'lucide-react'
import Badge from '../../components/common/Badge'
import { useAuth } from '../../hooks/useAuth'
import { MEMBERS, TRANSACTIONS } from '../../utils/mockData'
import { formatKES, formatDate } from '../../utils/format'

const MemberSavings = () => {
  const { user } = useAuth()
  const member = MEMBERS.find((m) => m.memberNo === user?.memberNo) || MEMBERS[0]
  const savingsTx = TRANSACTIONS.filter((t) => t.memberNo === member.memberNo && ['Deposit', 'Withdrawal'].includes(t.type))

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
      <PageHeader title="Savings" subtitle="Your savings and share capital balances" />
      <div className="grid grid-cols-2 gap-4 mb-6 max-w-md">
        <StatCard label="Savings Balance" value={formatKES(member.savings)} icon={PiggyBank} accent="teal" />
        <StatCard label="Share Capital" value={formatKES(member.shareCapital)} icon={Coins} accent="gold" />
      </div>
      <DataTable columns={cols} data={savingsTx} title="my-savings" exportable={false} />
    </div>
  )
}

export default MemberSavings
