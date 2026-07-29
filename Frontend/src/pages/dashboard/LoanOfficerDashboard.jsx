import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import {
  HandCoins, FileText, Clock, AlertTriangle, ShieldCheck,
  TrendingUp, CheckCircle, XCircle, Search, ArrowRight,
  UserCheck, DollarSign, Filter, RefreshCw
} from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import StatCard from '../../components/cards/StatCard'
import ChartCard from '../../components/charts/ChartCard'
import { SkeletonCard } from '../../components/loaders/Skeleton'
import DataTable from '../../components/tables/DataTable'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import { useAuth } from '../../hooks/useAuth'
import { formatKES, formatNumber, formatDate } from '../../utils/format'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

const LoanOfficerDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [stats, setStats] = useState({
    activePortfolio: 14250000,
    pendingApplications: 12,
    outstandingLoans: 18900000,
    portfolioAtRisk: 3.2,
    overdueLoansCount: 5,
    monthlyDisbursed: 4200000,
    guarantorsPending: 4
  })
  const [pendingLoans, setPendingLoans] = useState([])
  const [overdueLoans, setOverdueLoans] = useState([])

  useEffect(() => {
    fetchLoanOfficerData()
  }, [])

  const fetchLoanOfficerData = async (showToast = false) => {
    if (showToast) setRefreshing(true)
    else setLoading(true)

    try {
      const token = localStorage.getItem('accessToken')
      const headers = { Authorization: `Bearer ${token}` }

      const [statsRes, pendingRes, loansRes] = await Promise.all([
        axios.get(`${API_URL}/dashboard/admin/stats`, { headers }).catch(() => ({ data: { data: null } })),
        axios.get(`${API_URL}/loans?status=pending&limit=6`, { headers }).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_URL}/loans?status=disbursed&limit=6`, { headers }).catch(() => ({ data: { data: [] } }))
      ])

      if (statsRes.data.data) {
        setStats(prev => ({
          ...prev,
          activePortfolio: statsRes.data.data.outstandingLoans || prev.activePortfolio,
          pendingApplications: statsRes.data.data.pendingLoans || prev.pendingApplications,
          outstandingLoans: statsRes.data.data.outstandingLoans || prev.outstandingLoans
        }))
      }

      setPendingLoans(pendingRes.data.data || [
        { id: '1', applicationNumber: 'LA-2026-089', memberName: 'Alice Wambui', productName: 'Emergency Loan', amount: 150000, durationMonths: 12, guarantorsStatus: 'VERIFIED', appliedDate: '2026-07-26' },
        { id: '2', applicationNumber: 'LA-2026-090', memberName: 'David Ochieng', productName: 'Development Loan', amount: 500000, durationMonths: 36, guarantorsStatus: 'PENDING', appliedDate: '2026-07-27' },
        { id: '3', applicationNumber: 'LA-2026-091', memberName: 'Grace Mutua', productName: 'School Fees Loan', amount: 85000, durationMonths: 6, guarantorsStatus: 'VERIFIED', appliedDate: '2026-07-28' },
        { id: '4', applicationNumber: 'LA-2026-092', memberName: 'Peter Kamau', productName: 'Business Expansion', amount: 300000, durationMonths: 24, guarantorsStatus: 'VERIFIED', appliedDate: '2026-07-28' }
      ])

      setOverdueLoans(loansRes.data.data || [
        { id: '101', loanNumber: 'LN-2025-412', memberName: 'Joseph Kiptoo', amountOverdue: 24500, daysOverdue: 45, status: 'PAR_30' },
        { id: '102', loanNumber: 'LN-2025-388', memberName: 'Mary Otieno', amountOverdue: 18000, daysOverdue: 18, status: 'WATCH' }
      ])

      if (showToast) toast.success('Loan Officer Dashboard refreshed')
    } catch (error) {
      console.error('Error fetching loan officer data:', error)
      toast.error('Failed to update loan metrics')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const portfolioTrend = [
    { month: 'Feb', Disbursed: 3.2, Repaid: 2.8 },
    { month: 'Mar', Disbursed: 4.1, Repaid: 3.5 },
    { month: 'Apr', Disbursed: 3.8, Repaid: 3.9 },
    { month: 'May', Disbursed: 4.8, Repaid: 4.1 },
    { month: 'Jun', Disbursed: 5.2, Repaid: 4.6 },
    { month: 'Jul', Disbursed: 4.2, Repaid: 4.3 },
  ]

  const pendingColumns = [
    { key: 'applicationNumber', label: 'App No' },
    { key: 'memberName', label: 'Member Name' },
    { key: 'productName', label: 'Product' },
    { key: 'amount', label: 'Requested Amount', render: (r) => formatKES(r.amount) },
    { key: 'durationMonths', label: 'Term', render: (r) => `${r.durationMonths} Mos` },
    { 
      key: 'guarantorsStatus', 
      label: 'Guarantors',
      render: (r) => (
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
          r.guarantorsStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' :
          'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
        }`}>
          {r.guarantorsStatus}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Review Action',
      render: (r) => (
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline"
            className="text-xs py-1 px-2.5"
            onClick={() => navigate(`/loans/${r.id}`)}
          >
            Assess
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <PageHeader
        title={`Credit & Lending Portal | ${user?.firstName || 'Loan Officer'}`}
        subtitle="Manage loan applications, credit risk evaluations, guarantors, and portfolio performance."
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              loading={refreshing}
              onClick={() => fetchLoanOfficerData(true)}
            >
              Refresh
            </Button>
            <Button
              size="sm"
              icon={HandCoins}
              onClick={() => navigate('/loans/apply')}
            >
              New Loan Application
            </Button>
          </div>
        }
      />

      {/* Primary Credit Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard
              label="Active Loan Portfolio"
              value={formatKES(stats.activePortfolio)}
              icon={HandCoins}
              accent="info"
              onClick={() => navigate('/loans')}
              subtitle="Total outstanding principal"
            />
            <StatCard
              label="Pending Applications"
              value={formatNumber(stats.pendingApplications)}
              icon={Clock}
              accent="gold"
              onClick={() => navigate('/loans?status=pending')}
              subtitle="Awaiting credit assessment"
            />
            <StatCard
              label="Portfolio at Risk (PAR > 30)"
              value={`${stats.portfolioAtRisk}%`}
              icon={AlertTriangle}
              accent="danger"
              onClick={() => navigate('/loans?status=overdue')}
              subtitle={`${stats.overdueLoansCount} overdue loans`}
            />
            <StatCard
              label="Monthly Disbursed (MTD)"
              value={formatKES(stats.monthlyDisbursed)}
              icon={TrendingUp}
              accent="teal"
              onClick={() => navigate('/loans')}
              subtitle="Approved & paid out"
            />
          </>
        )}
      </div>

      {/* Loan Officer Quick Command Toolbar */}
      <Card className="p-4 bg-slate-900 text-white rounded-xl shadow-lg border border-slate-800">
        <h3 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">
          Credit Quick Action Desk
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => navigate('/loans/apply')}
            className="flex flex-col items-center justify-center p-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 transition border border-slate-700/50"
          >
            <HandCoins className="w-5 h-5 text-teal-400 mb-1" />
            <span className="text-xs font-medium">New Application</span>
          </button>
          <button
            onClick={() => navigate('/loans?status=pending')}
            className="flex flex-col items-center justify-center p-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 transition border border-slate-700/50"
          >
            <Clock className="w-5 h-5 text-amber-400 mb-1" />
            <span className="text-xs font-medium">Credit Reviews</span>
          </button>
          <button
            onClick={() => navigate('/loans/guarantors')}
            className="flex flex-col items-center justify-center p-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 transition border border-slate-700/50"
          >
            <UserCheck className="w-5 h-5 text-blue-400 mb-1" />
            <span className="text-xs font-medium">Guarantors</span>
          </button>
          <button
            onClick={() => navigate('/loans/repayment')}
            className="flex flex-col items-center justify-center p-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 transition border border-slate-700/50"
          >
            <DollarSign className="w-5 h-5 text-emerald-400 mb-1" />
            <span className="text-xs font-medium">Loan Repayments</span>
          </button>
          <button
            onClick={() => navigate('/members/search')}
            className="flex flex-col items-center justify-center p-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 transition border border-slate-700/50"
          >
            <Search className="w-5 h-5 text-purple-400 mb-1" />
            <span className="text-xs font-medium">Check Eligibility</span>
          </button>
          <button
            onClick={() => navigate('/reports')}
            className="flex flex-col items-center justify-center p-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 transition border border-slate-700/50"
          >
            <FileText className="w-5 h-5 text-rose-400 mb-1" />
            <span className="text-xs font-medium">Portfolio Reports</span>
          </button>
        </div>
      </Card>

      {/* Main Content Grid: Pending Applications & Portfolio Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Loan Applications Table */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Loan Applications Awaiting Review
                </h2>
                <p className="text-xs text-slate-500">Requires credit assessment and guarantor verification</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/loans?status=pending')}>
                View All
              </Button>
            </div>
            <DataTable
              columns={pendingColumns}
              data={pendingLoans}
              loading={loading}
              emptyMessage="No pending loan applications requiring review."
            />
          </Card>
        </div>

        {/* Portfolio Risk & Overdue Alerts Sidebar */}
        <div className="space-y-6">
          <Card className="p-4 sm:p-6">
            <h3 className="text-md font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Overdue & Arrears Watchlist
            </h3>
            <p className="text-xs text-slate-500 mb-4">Loans requiring immediate collection follow-up</p>
            <div className="space-y-3">
              {overdueLoans.map((item) => (
                <div key={item.id} className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-semibold text-rose-900 dark:text-rose-200">{item.memberName}</p>
                    <p className="text-xs text-rose-700 dark:text-rose-400">{item.loanNumber} • {item.daysOverdue} days overdue</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-rose-800 dark:text-rose-300">{formatKES(item.amountOverdue)}</p>
                    <button 
                      onClick={() => navigate(`/loans/${item.id}`)}
                      className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
                    >
                      Follow Up
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <ChartCard
            title="Loan Disbursements vs Repayments (Millions KES)"
            subtitle="6-month trend"
          >
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={portfolioTrend}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `${value}M KES`} />
                <Area type="monotone" dataKey="Disbursed" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.2} />
                <Area type="monotone" dataKey="Repaid" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </div>
  )
}

export default LoanOfficerDashboard
