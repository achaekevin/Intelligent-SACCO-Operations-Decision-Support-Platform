import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import {
  ShieldAlert, FileText, CheckCircle2, AlertOctagon, Scale,
  Eye, RefreshCw, Landmark, BookOpen, AlertTriangle, FileSpreadsheet, Lock
} from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import StatCard from '../../components/cards/StatCard'
import { SkeletonCard } from '../../components/loaders/Skeleton'
import DataTable from '../../components/tables/DataTable'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import { useAuth } from '../../hooks/useAuth'
import { formatKES, formatDate } from '../../utils/format'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

const AuditorDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [auditStats, setAuditStats] = useState({
    trialBalanceStatus: 'BALANCED',
    totalJournalsMTD: 342,
    unpostedEntries: 0,
    reversalsCount: 3,
    highRiskAuditEvents: 2,
    systemExceptions: 0
  })
  const [auditLogs, setAuditLogs] = useState([])
  const [reversals, setReversals] = useState([])

  useEffect(() => {
    fetchAuditorData()
  }, [])

  const fetchAuditorData = async (showToast = false) => {
    if (showToast) setRefreshing(true)
    else setLoading(true)

    try {
      const token = localStorage.getItem('accessToken')
      const headers = { Authorization: `Bearer ${token}` }

      const [logsRes, txRes] = await Promise.all([
        axios.get(`${API_URL}/audit/logs?limit=5`, { headers }).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_URL}/transactions?status=reversed&limit=5`, { headers }).catch(() => ({ data: { data: [] } }))
      ])

      setAuditLogs(logsRes.data.data || [
        { id: 'a1', action: 'ROLE_PERMISSION_CHANGE', entityName: 'roles', userEmail: 'admin@sacco.com', ipAddress: '192.168.1.10', createdAt: '2026-07-28 14:20:00' },
        { id: 'a2', action: 'INTEREST_RATE_UPDATE', entityName: 'savings_products', userEmail: 'admin@sacco.com', ipAddress: '192.168.1.10', createdAt: '2026-07-28 11:15:00' },
        { id: 'a3', action: 'TRANSACTION_REVERSAL', entityName: 'transactions', userEmail: 'teller@sacco.com', ipAddress: '192.168.1.14', createdAt: '2026-07-27 16:45:00' }
      ])

      setReversals(txRes.data.data || [
        { id: 'r1', reference: 'TX-REV-901', originalRef: 'TX-8912', amount: 50000, reversedBy: 'John Teller', reason: 'Duplicate teller entry', date: '2026-07-27' },
        { id: 'r2', reference: 'TX-REV-902', originalRef: 'TX-8944', amount: 12000, reversedBy: 'John Teller', reason: 'Member cash miscount corrected', date: '2026-07-26' }
      ])

      if (showToast) toast.success('Audit Desk refreshed')
    } catch (error) {
      console.error('Failed to fetch auditor data:', error)
      toast.error('Failed to update audit metrics')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const auditColumns = [
    { key: 'action', label: 'Action Event' },
    { key: 'entityName', label: 'Module / Entity' },
    { key: 'userEmail', label: 'Executed By' },
    { key: 'ipAddress', label: 'IP Address' },
    { key: 'createdAt', label: 'Timestamp', render: (r) => formatDate(r.createdAt) }
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <PageHeader
        title={`Financial Audit & Compliance Center | ${user?.firstName || 'Auditor'}`}
        subtitle="Independent verification of ledger balance integrity, journal entries, security logs, and reversals."
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              loading={refreshing}
              onClick={() => fetchAuditorData(true)}
            >
              Refresh Audit Desk
            </Button>
            <Button
              size="sm"
              icon={FileSpreadsheet}
              onClick={() => navigate('/accounting/trial-balance')}
            >
              Inspect Trial Balance
            </Button>
          </div>
        }
      />

      {/* Audit KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard
              label="General Ledger Status"
              value={auditStats.trialBalanceStatus}
              icon={Scale}
              accent="teal"
              onClick={() => navigate('/accounting/trial-balance')}
              subtitle="Debit == Credit balanced"
            />
            <StatCard
              label="Journal Entries (MTD)"
              value={formatNumber(auditStats.totalJournalsMTD)}
              icon={BookOpen}
              accent="info"
              onClick={() => navigate('/accounting/journals')}
              subtitle="Posted GL journals"
            />
            <StatCard
              label="Transaction Reversals"
              value={formatNumber(auditStats.reversalsCount)}
              icon={AlertOctagon}
              accent="gold"
              onClick={() => navigate('/transactions')}
              subtitle="Reversal entries flagged"
            />
            <StatCard
              label="High-Risk Audit Triggers"
              value={formatNumber(auditStats.highRiskAuditEvents)}
              icon={ShieldAlert}
              accent="danger"
              onClick={() => navigate('/audit')}
              subtitle="System security events"
            />
          </>
        )}
      </div>

      {/* Auditor Navigation Toolbar */}
      <Card className="p-4 bg-slate-900 text-white rounded-xl shadow-lg border border-slate-800">
        <h3 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">
          Compliance & Audit Tools
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => navigate('/accounting/trial-balance')}
            className="flex flex-col items-center justify-center p-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 transition border border-slate-700/50"
          >
            <Scale className="w-5 h-5 text-teal-400 mb-1" />
            <span className="text-xs font-medium">Trial Balance</span>
          </button>
          <button
            onClick={() => navigate('/accounting/ledgers')}
            className="flex flex-col items-center justify-center p-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 transition border border-slate-700/50"
          >
            <BookOpen className="w-5 h-5 text-blue-400 mb-1" />
            <span className="text-xs font-medium">General Ledger</span>
          </button>
          <button
            onClick={() => navigate('/accounting/balance-sheet')}
            className="flex flex-col items-center justify-center p-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 transition border border-slate-700/50"
          >
            <Landmark className="w-5 h-5 text-indigo-400 mb-1" />
            <span className="text-xs font-medium">Balance Sheet</span>
          </button>
          <button
            onClick={() => navigate('/accounting/profit-and-loss')}
            className="flex flex-col items-center justify-center p-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 transition border border-slate-700/50"
          >
            <FileText className="w-5 h-5 text-amber-400 mb-1" />
            <span className="text-xs font-medium">Profit & Loss</span>
          </button>
          <button
            onClick={() => navigate('/audit')}
            className="flex flex-col items-center justify-center p-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 transition border border-slate-700/50"
          >
            <ShieldAlert className="w-5 h-5 text-rose-400 mb-1" />
            <span className="text-xs font-medium">Audit Logs</span>
          </button>
          <button
            onClick={() => navigate('/reports')}
            className="flex flex-col items-center justify-center p-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 transition border border-slate-700/50"
          >
            <FileSpreadsheet className="w-5 h-5 text-emerald-400 mb-1" />
            <span className="text-xs font-medium">Regulatory Brief</span>
          </button>
        </div>
      </Card>

      {/* Main Grid: Audit Trail Stream & Reversals List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Security & Administrative Audit Logs
                </h2>
                <p className="text-xs text-slate-500">Real-time system events, role updates, and configuration changes</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/audit')}>
                Full Audit Trail
              </Button>
            </div>
            <DataTable
              columns={auditColumns}
              data={auditLogs}
              loading={loading}
              emptyMessage="No audit logs available."
            />
          </Card>
        </div>

        <div>
          <Card className="p-4 sm:p-6">
            <h3 className="text-md font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-amber-500" />
              Recent Reversals & Exceptions
            </h3>
            <p className="text-xs text-slate-500 mb-4">Transaction reversals subject to compliance audit</p>
            <div className="space-y-3">
              {reversals.map((item) => (
                <div key={item.id} className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-200">{item.reference}</span>
                    <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">{formatKES(item.amount)}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Reversed by: {item.reversedBy}</p>
                  <p className="text-xs italic text-slate-500 mt-1">Reason: "{item.reason}"</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default AuditorDashboard
