import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
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
import { formatKES, formatNumber, formatDate } from '../../utils/format'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [savingsGrowth, setSavingsGrowth] = useState([])
  const [memberGrowth, setMemberGrowth] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('accessToken')
      const headers = { Authorization: `Bearer ${token}` }

      const [statsRes, txRes, savingsRes, membersRes] = await Promise.all([
        axios.get(`${API_URL}/dashboard/admin/stats`, { headers }),
        axios.get(`${API_URL}/dashboard/admin/transactions?limit=6`, { headers }),
        axios.get(`${API_URL}/dashboard/charts/savings-growth?months=6`, { headers }),
        axios.get(`${API_URL}/dashboard/charts/member-growth?months=6`, { headers }),
      ])

      setStats(statsRes.data.data)
      setTransactions(txRes.data.data || [])
      setSavingsGrowth(savingsRes.data.data || [])
      setMemberGrowth(membersRes.data.data || [])
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const txColumns = [
    { key: 'reference', label: 'Ref' },
    { 
      key: 'member', 
      label: 'Member',
      render: (r) => r.member ? r.member.name : 'N/A'
    },
    { key: 'type', label: 'Type' },
    { key: 'amount', label: 'Amount', render: (r) => formatKES(r.amount) },
    { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
    { 
      key: 'status', 
      label: 'Status', 
      render: (r) => (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${
          r.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
          r.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}>
          {r.status}
        </span>
      )
    },
  ]

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.firstName || 'there'}`}
        subtitle="Here's what's happening across your SACCO today."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
        ) : stats ? (
          <>
            <StatCard 
              label="Total Members" 
              value={formatNumber(stats.totalMembers)} 
              icon={Users} 
              accent="teal" 
              onClick={() => navigate('/members')}
            />
            <StatCard 
              label="Total Savings" 
              value={formatKES(stats.totalSavings)} 
              icon={PiggyBank} 
              accent="gold" 
              onClick={() => navigate('/savings')}
            />
            <StatCard 
              label="Active Loans" 
              value={formatNumber(stats.activeLoans)} 
              icon={HandCoins} 
              accent="info" 
              onClick={() => navigate('/loans')}
            />
            <StatCard 
              label="Pending Loans" 
              value={formatNumber(stats.pendingLoans)} 
              icon={Clock} 
              accent="gold" 
              onClick={() => navigate('/loans?status=pending')}
            />
            <StatCard 
              label="Total Deposits (MTD)" 
              value={formatKES(stats.totalDeposits)} 
              icon={Wallet} 
              accent="teal" 
              onClick={() => navigate('/savings/deposits')}
            />
            <StatCard 
              label="Monthly Income" 
              value={formatKES(stats.monthlyIncome)} 
              icon={TrendingUp} 
              accent="info" 
              onClick={() => navigate('/accounting/income-expenses')}
            />
            <StatCard 
              label="Total Branches" 
              value={stats.totalBranches} 
              icon={Landmark} 
              accent="teal" 
              onClick={() => navigate('/branches')}
            />
            <StatCard 
              label="Loan Default Rate" 
              value={`${stats.loanDefaultRate}%`} 
              icon={AlertTriangle} 
              accent="danger" 
              onClick={() => navigate('/loans?status=defaulted')}
            />
          </>
        ) : (
          <div className="col-span-4 text-center py-8">Failed to load statistics</div>
        )}
      </div>

      {!loading && savingsGrowth.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <ChartCard title="Savings Growth" subtitle="Total savings vs. share capital (KES millions)">
            <ResponsiveContainer>
              <AreaChart data={savingsGrowth}>
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

          <ChartCard title="Member Growth" subtitle="Cumulative registered members">
            <ResponsiveContainer>
              <AreaChart data={memberGrowth}>
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
        </div>
      )}

      {!loading && transactions.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold text-ink-800 dark:text-ink-50 mb-3">Recent Transactions</h3>
          <DataTable columns={txColumns} data={transactions} title="recent-transactions" pageSize={6} exportable={false} />
        </div>
      )}
    </div>
  )
}

export default Dashboard
