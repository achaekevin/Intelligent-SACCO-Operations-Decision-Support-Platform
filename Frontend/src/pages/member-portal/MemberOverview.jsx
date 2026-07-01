import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { PiggyBank, Coins, HandCoins, Calendar } from 'lucide-react'
import StatCard from '../../components/cards/StatCard'
import ChartCard from '../../components/charts/ChartCard'
import DataTable from '../../components/tables/DataTable'
import { SkeletonCard } from '../../components/loaders/Skeleton'
import { useAuth } from '../../hooks/useAuth'
import { formatKES, formatDate } from '../../utils/format'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

const MemberOverview = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [savingsGrowth, setSavingsGrowth] = useState([])

  useEffect(() => {
    fetchMemberDashboard()
  }, [])

  const fetchMemberDashboard = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('accessToken')
      const headers = { Authorization: `Bearer ${token}` }

      const [statsRes, txRes, savingsRes] = await Promise.all([
        axios.get(`${API_URL}/dashboard/member/stats`, { headers }),
        axios.get(`${API_URL}/dashboard/member/transactions?limit=5`, { headers }),
        axios.get(`${API_URL}/dashboard/charts/savings-growth?months=6`, { headers }),
      ])

      setStats(statsRes.data.data)
      setTransactions(txRes.data.data || [])
      setSavingsGrowth(savingsRes.data.data || [])
    } catch (error) {
      console.error('Failed to fetch member dashboard:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const txCols = [
    { key: 'reference', label: 'Ref' },
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
      <h1 className="text-xl font-bold text-ink-800 dark:text-ink-50 mb-1">
        Hi, {user?.firstName || 'there'} 👋
      </h1>
      <p className="text-sm text-ink-400 mb-6">Here's a snapshot of your SACCO account.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : stats ? (
          <>
            <StatCard 
              label="Savings Balance" 
              value={formatKES(stats.savingsBalance)} 
              icon={PiggyBank} 
              accent="teal"
              onClick={() => navigate('/member/savings')}
            />
            <StatCard 
              label="Share Capital" 
              value={formatKES(stats.shareCapitalBalance)} 
              icon={Coins} 
              accent="gold"
              onClick={() => navigate('/member/savings')}
            />
            <StatCard 
              label="Active Loans" 
              value={stats.activeLoans} 
              icon={HandCoins} 
              accent="info"
              onClick={() => navigate('/member/loans')}
            />
            <StatCard 
              label="Loan Balance" 
              value={formatKES(stats.totalLoanBalance)} 
              icon={HandCoins} 
              accent="danger"
              onClick={() => navigate('/member/loans')}
            />
          </>
        ) : (
          <div className="col-span-4 text-center py-8">Failed to load statistics</div>
        )}
      </div>

      {!loading && stats?.memberSince && (
        <div className="mb-6 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-800">
          <div className="flex items-center gap-2 text-teal-800 dark:text-teal-300">
            <Calendar size={20} />
            <span className="text-sm font-medium">
              Member Since: {formatDate(stats.memberSince)}
            </span>
          </div>
        </div>
      )}

      {!loading && savingsGrowth.length > 0 && (
        <ChartCard title="Your Savings Growth" subtitle="Last 6 months (KES millions)" height={240}>
          <ResponsiveContainer>
            <AreaChart data={savingsGrowth}>
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
      )}

      {!loading && transactions.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold text-ink-800 dark:text-ink-50 mb-3">Recent Transactions</h3>
          <DataTable columns={txCols} data={transactions} title="my-transactions" exportable={false} pageSize={5} />
        </div>
      )}

      {!loading && transactions.length === 0 && (
        <div className="mt-6 text-center py-8 text-gray-500">
          No transactions yet
        </div>
      )}
    </div>
  )
}

export default MemberOverview
