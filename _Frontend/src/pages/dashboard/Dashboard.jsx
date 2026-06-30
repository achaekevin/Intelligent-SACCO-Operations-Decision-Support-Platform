import { useState, useEffect } from 'react'
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { Users, PiggyBank, HandCoins, Clock, Landmark, TrendingUp, AlertTriangle, Wallet } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import StatCard from '../../components/cards/StatCard'
import ChartCard from '../../components/charts/ChartCard'
import { SkeletonCard } from '../../components/loaders/Skeleton'
import DataTable from '../../components/tables/DataTable'
import Badge from '../../components/common/Badge'
import { useAuth } from '../../hooks/useAuth'
import {
  DASHBOARD_STATS, SAVINGS_GROWTH, MONTHLY_INCOME, LOAN_REPAYMENT_TREND,
  BRANCH_PERFORMANCE, MEMBER_GROWTH, LOAN_STATUS_BREAKDOWN, TRANSACTIONS,
} from '../../utils/mockData'
import { formatKES, formatNumber, formatDate } from '../../utils/format'

const Dashboard = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(t)
  }, [])

  const recentTx = [...TRANSACTIONS].slice(0, 6)

  const txColumns = [
    { key: 'id', label: 'Ref' },
    { key: 'member', label: 'Member' },
    { key: 'type', label: 'Type' },
    { key: 'amount', label: 'Amount', render: (r) => formatKES(r.amount) },
    { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
    { key: 'status', label: 'Status', render: (r) => <Badge>{r.status}</Badge> },
  ]

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0] || 'there'}`}
        subtitle="Here's what's happening across your SACCO today."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard label="Total Members" value={formatNumber(DASHBOARD_STATS.totalMembers)} icon={Users} trend="up" trendValue="+4.2%" accent="teal" />
            <StatCard label="Total Savings" value={formatKES(DASHBOARD_STATS.totalSavings)} icon={PiggyBank} trend="up" trendValue="+6.8%" accent="gold" />
            <StatCard label="Active Loans" value={formatNumber(DASHBOARD_STATS.activeLoans)} icon={HandCoins} trend="up" trendValue="+2.1%" accent="info" />
            <StatCard label="Pending Loans" value={formatNumber(DASHBOARD_STATS.pendingLoans)} icon={Clock} trend="down" trendValue="-1.4%" accent="gold" />
            <StatCard label="Total Deposits (MTD)" value={formatKES(DASHBOARD_STATS.totalDeposits)} icon={Wallet} trend="up" trendValue="+3.6%" accent="teal" />
            <StatCard label="Monthly Income" value={formatKES(DASHBOARD_STATS.monthlyIncome)} icon={TrendingUp} trend="up" trendValue="+5.9%" accent="info" />
            <StatCard label="Total Branches" value={DASHBOARD_STATS.totalBranches} icon={Landmark} accent="teal" />
            <StatCard label="Loan Default Rate" value={`${DASHBOARD_STATS.loanDefaults}%`} icon={AlertTriangle} trend="down" trendValue="-0.5%" accent="danger" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ChartCard title="Savings Growth" subtitle="Total savings vs. share capital (KES millions)">
          <ResponsiveContainer>
            <AreaChart data={SAVINGS_GROWTH}>
              <defs>
                <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0B4F4A" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#0B4F4A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7E6" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="savings" name="Savings" stroke="#0B4F4A" strokeWidth={2} fill="url(#savingsGrad)" />
              <Line type="monotone" dataKey="shareCapital" name="Share Capital" stroke="#D9A441" strokeWidth={2} dot={false} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly Income" subtitle="Interest income vs. fee income (KES millions)">
          <ResponsiveContainer>
            <BarChart data={MONTHLY_INCOME}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7E6" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="interest" name="Interest" fill="#0B4F4A" radius={[4, 4, 0, 0]} />
              <Bar dataKey="fees" name="Fees" fill="#D9A441" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <ChartCard title="Loan Repayment Trend" subtitle="% of loans by repayment status" height={260}>
          <ResponsiveContainer>
            <LineChart data={LOAN_REPAYMENT_TREND}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7E6" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="onTime" name="On time" stroke="#3F8F5F" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="late" name="Late" stroke="#D9A441" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="defaulted" name="Defaulted" stroke="#C24A3D" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Branch Performance" subtitle="Revenue by branch (KES millions)" height={260}>
          <ResponsiveContainer>
            <BarChart data={BRANCH_PERFORMANCE} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7E6" />
              <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
              <Tooltip />
              <Bar dataKey="revenue" fill="#246E61" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Loan Status Breakdown" subtitle="Current loan book" height={260}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={LOAN_STATUS_BREAKDOWN} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                {LOAN_STATUS_BREAKDOWN.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Member Growth" subtitle="Cumulative registered members" height={220}>
        <ResponsiveContainer>
          <AreaChart data={MEMBER_GROWTH}>
            <defs>
              <linearGradient id="memberGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#D9A441" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#D9A441" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7E6" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip />
            <Area type="monotone" dataKey="members" stroke="#D9A441" strokeWidth={2} fill="url(#memberGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="mt-4">
        <h3 className="font-semibold text-ink-800 dark:text-ink-50 mb-3">Recent Transactions</h3>
        <DataTable columns={txColumns} data={recentTx} title="recent-transactions" pageSize={6} exportable={false} />
      </div>
    </div>
  )
}

export default Dashboard
