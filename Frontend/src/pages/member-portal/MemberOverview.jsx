import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { PiggyBank, Coins, HandCoins, Calendar } from 'lucide-react'
import StatCard from '../../components/cards/StatCard'
import ChartCard from '../../components/charts/ChartCard'
import DataTable from '../../components/tables/DataTable'
import Badge from '../../components/common/Badge'
import { useAuth } from '../../hooks/useAuth'
import { MEMBERS, LOANS, TRANSACTIONS, SAVINGS_GROWTH } from '../../utils/mockData'
import { formatKES, formatDate } from '../../utils/format'

const MemberOverview = () => {
  const { user } = useAuth()
  const member = MEMBERS.find((m) => m.memberNo === user?.memberNo) || MEMBERS[0]
  const myLoans = LOANS.filter((l) => l.memberNo === member.memberNo)
  const myTx = TRANSACTIONS.filter((t) => t.memberNo === member.memberNo).slice(0, 5)

  const txCols = [
    { key: 'id', label: 'Ref' },
    { key: 'type', label: 'Type' },
    { key: 'amount', label: 'Amount', render: (r) => formatKES(r.amount) },
    { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
    { key: 'status', label: 'Status', render: (r) => <Badge>{r.status}</Badge> },
  ]

  return (
    <div>
      <h1 className="text-xl font-bold text-ink-800 dark:text-ink-50 mb-1">Hi, {user?.name?.split(' ')[0]} 👋</h1>
      <p className="text-sm text-ink-400 mb-6">Here's a snapshot of your SACCO account.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Savings Balance" value={formatKES(member.savings)} icon={PiggyBank} accent="teal" />
        <StatCard label="Share Capital" value={formatKES(member.shareCapital)} icon={Coins} accent="gold" />
        <StatCard label="Active Loans" value={myLoans.filter((l) => l.status === 'Active').length} icon={HandCoins} accent="info" />
        <StatCard label="Member Since" value={formatDate(member.joinDate)} icon={Calendar} accent="teal" />
      </div>

      <ChartCard title="Your Savings Growth" subtitle="Last 6 months (KES thousands)" height={240}>
        <ResponsiveContainer>
          <AreaChart data={SAVINGS_GROWTH}>
            <defs>
              <linearGradient id="mySavings" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0B4F4A" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#0B4F4A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7E6" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip />
            <Area type="monotone" dataKey="savings" stroke="#0B4F4A" strokeWidth={2} fill="url(#mySavings)" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="mt-6">
        <h3 className="font-semibold text-ink-800 dark:text-ink-50 mb-3">Recent Transactions</h3>
        <DataTable columns={txCols} data={myTx} title="my-transactions" exportable={false} pageSize={5} />
      </div>
    </div>
  )
}

export default MemberOverview
