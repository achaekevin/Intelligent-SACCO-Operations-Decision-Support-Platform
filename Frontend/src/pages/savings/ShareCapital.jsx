import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DollarSign, TrendingUp, Users, Eye } from 'lucide-react'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import PageHeader from '../../components/common/PageHeader'
import Card from '../../components/common/Card'
import DataTable from '../../components/tables/DataTable'
import Badge from '../../components/common/Badge'
import { formatKES, formatDate } from '../../utils/format'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

const ShareCapital = () => {
  const navigate = useNavigate()
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchShareCapitalAccounts()
  }, [])

  const fetchShareCapitalAccounts = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await axios.get(`${API_URL}/savings/accounts?accountType=share_capital`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setAccounts(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch share capital accounts:', error)
      toast.error('Failed to load share capital accounts')
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      key: 'member',
      label: 'Member',
      render: (r) => (
        <div>
          <p className="font-medium text-ink-800 dark:text-ink-50">
            {r.member ? `${r.member.firstName} ${r.member.lastName}` : 'N/A'}
          </p>
          <p className="text-xs text-ink-400">{r.member?.memberNumber || 'N/A'}</p>
        </div>
      )
    },
    {
      key: 'accountNumber',
      label: 'Account Number',
    },
    {
      key: 'balance',
      label: 'Share Capital',
      render: (r) => (
        <span className="font-semibold text-purple-600 dark:text-purple-400">
          {formatKES(r.balance)}
        </span>
      )
    },
    {
      key: 'minimumBalance',
      label: 'Required Minimum',
      render: (r) => formatKES(r.minimumBalance || 0)
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => {
        const isBelowMinimum = parseFloat(r.balance) < parseFloat(r.minimumBalance || 0)
        return isBelowMinimum ? (
          <Badge variant="warning">Below Minimum</Badge>
        ) : (
          <Badge>{r.status}</Badge>
        )
      }
    },
    {
      key: 'lastTransactionAt',
      label: 'Last Contribution',
      render: (r) => r.lastTransactionAt ? formatDate(r.lastTransactionAt) : 'No contributions'
    },
    {
      key: 'actions',
      label: '',
      sortable: false,
      render: (r) => (
        <button
          onClick={() => navigate(`/savings/accounts/${r.id}`)}
          className="flex items-center gap-1 text-teal-600 dark:text-gold-400 text-xs font-semibold hover:underline"
        >
          <Eye size={14} />
          View
        </button>
      )
    }
  ]

  if (loading) {
    return (
      <div>
        <PageHeader title="Share Capital" subtitle="Loading..." />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      </div>
    )
  }

  const totalShareCapital = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0)
  const activeMembers = accounts.filter(acc => acc.status === 'active').length
  const belowMinimum = accounts.filter(acc => parseFloat(acc.balance) < parseFloat(acc.minimumBalance || 0)).length
  const averageContribution = activeMembers > 0 ? totalShareCapital / activeMembers : 0

  return (
    <div>
      <PageHeader
        title="Share Capital"
        subtitle="Member share capital contributions and tracking"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-ink-400 uppercase tracking-wide font-medium">Total Share Capital</p>
              <p className="text-2xl font-display font-bold text-ink-800 dark:text-ink-50 mt-2">
                {formatKES(totalShareCapital)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <DollarSign className="text-purple-600 dark:text-purple-400" size={20} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-ink-400 uppercase tracking-wide font-medium">Active Members</p>
              <p className="text-2xl font-display font-bold text-ink-800 dark:text-ink-50 mt-2">
                {activeMembers}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Users className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-ink-400 uppercase tracking-wide font-medium">Average Contribution</p>
              <p className="text-2xl font-display font-bold text-ink-800 dark:text-ink-50 mt-2">
                {formatKES(averageContribution)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <TrendingUp className="text-green-600 dark:text-green-400" size={20} />
            </div>
          </div>
        </Card>

        <Card>
          <div>
            <p className="text-xs text-ink-400 uppercase tracking-wide font-medium">Below Minimum</p>
            <p className="text-2xl font-display font-bold text-orange-600 dark:text-orange-400 mt-2">
              {belowMinimum}
            </p>
            <p className="text-xs text-ink-400 mt-1">
              {activeMembers > 0 ? `${((belowMinimum / activeMembers) * 100).toFixed(1)}%` : '0%'} of members
            </p>
          </div>
        </Card>
      </div>

      {/* Share Capital Requirements Info */}
      <Card className="mb-6">
        <h3 className="text-lg font-semibold text-ink-800 dark:text-ink-50 mb-3">Share Capital Requirements</h3>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-blue-800 dark:text-blue-300 font-medium">Minimum Contribution</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                {formatKES(accounts[0]?.minimumBalance || 500)}
              </p>
            </div>
            <div>
              <p className="text-blue-800 dark:text-blue-300 font-medium">Purpose</p>
              <p className="text-ink-600 dark:text-ink-300 mt-1">
                Ownership stake in SACCO and dividend eligibility
              </p>
            </div>
            <div>
              <p className="text-blue-800 dark:text-blue-300 font-medium">Benefits</p>
              <p className="text-ink-600 dark:text-ink-300 mt-1">
                Voting rights, dividends, and loan guarantees
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Accounts Table */}
      <Card>
        <h3 className="text-lg font-semibold text-ink-800 dark:text-ink-50 mb-4">
          Member Share Capital Accounts
        </h3>
        {accounts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No share capital accounts found
          </div>
        ) : (
          <DataTable 
            columns={columns} 
            data={accounts} 
            title="share-capital-accounts" 
            exportable 
          />
        )}
      </Card>
    </div>
  )
}

export default ShareCapital
