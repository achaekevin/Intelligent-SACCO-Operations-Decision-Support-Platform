import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Filter, Eye } from 'lucide-react'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import PageHeader from '../../components/common/PageHeader'
import DataTable from '../../components/tables/DataTable'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import { formatKES, formatDate } from '../../utils/format'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

const SavingsAccounts = () => {
  const navigate = useNavigate()
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [accountTypeFilter, setAccountTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await axios.get(`${API_URL}/savings/accounts`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setAccounts(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch accounts:', error)
      toast.error('Failed to load savings accounts')
    } finally {
      setLoading(false)
    }
  }

  // Filter accounts
  const filteredAccounts = accounts.filter(account => {
    const memberName = account.member 
      ? `${account.member.firstName} ${account.member.lastName}`.toLowerCase()
      : ''
    const accountNumber = (account.accountNumber || '').toLowerCase()
    const search = searchTerm.toLowerCase()

    const matchesSearch = !searchTerm || 
      memberName.includes(search) ||
      accountNumber.includes(search)

    const matchesType = !accountTypeFilter || account.accountType === accountTypeFilter
    const matchesStatus = !statusFilter || account.status === statusFilter

    return matchesSearch && matchesType && matchesStatus
  })

  const getAccountTypeLabel = (type) => {
    const labels = {
      ordinary: 'Ordinary Savings',
      share_capital: 'Share Capital',
      fixed_deposit: 'Fixed Deposit'
    }
    return labels[type] || type
  }

  const columns = [
    {
      key: 'accountNumber',
      label: 'Account Number',
      render: (r) => (
        <div>
          <p className="font-medium text-ink-800 dark:text-ink-50">{r.accountNumber}</p>
          <p className="text-xs text-ink-400">{r.member ? `${r.member.firstName} ${r.member.lastName}` : 'N/A'}</p>
        </div>
      )
    },
    {
      key: 'accountType',
      label: 'Type',
      render: (r) => (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${
          r.accountType === 'ordinary' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
          r.accountType === 'share_capital' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
        }`}>
          {getAccountTypeLabel(r.accountType)}
        </span>
      )
    },
    {
      key: 'balance',
      label: 'Balance',
      render: (r) => (
        <span className="font-semibold text-ink-800 dark:text-ink-50">
          {formatKES(r.balance)}
        </span>
      )
    },
    {
      key: 'interestRate',
      label: 'Interest Rate',
      render: (r) => `${r.interestRate}%`
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <Badge>{r.status}</Badge>
    },
    {
      key: 'lastTransactionAt',
      label: 'Last Transaction',
      render: (r) => r.lastTransactionAt ? formatDate(r.lastTransactionAt) : 'N/A'
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
        <PageHeader title="Savings Accounts" subtitle="Loading accounts..." />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      </div>
    )
  }

  const totalBalance = filteredAccounts.reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0)

  return (
    <div>
      <PageHeader
        title="Savings Accounts"
        subtitle={`${filteredAccounts.length} accounts • Total Balance: ${formatKES(totalBalance)}`}
        actions={
          <Button icon={Plus} onClick={() => navigate('/savings/accounts/create')}>
            Open Account
          </Button>
        }
      />

      {/* Search and Filters */}
      <div className="mb-4 bg-white dark:bg-ink-800 rounded-lg p-4 shadow-card border border-ink-50 dark:border-ink-700">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by account number or member name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              showFilters 
                ? 'bg-teal-50 border-teal-500 text-teal-700 dark:bg-teal-900 dark:border-teal-600 dark:text-teal-300' 
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Filter size={18} />
            <span className="font-medium">Filters</span>
            {(accountTypeFilter || statusFilter) && (
              <span className="bg-teal-500 text-white text-xs px-2 py-0.5 rounded-full">
                {[accountTypeFilter, statusFilter].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Account Type
                </label>
                <select
                  value={accountTypeFilter}
                  onChange={(e) => setAccountTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All Types</option>
                  <option value="ordinary">Ordinary Savings</option>
                  <option value="share_capital">Share Capital</option>
                  <option value="fixed_deposit">Fixed Deposit</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="dormant">Dormant</option>
                  <option value="closed">Closed</option>
                  <option value="frozen">Frozen</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setAccountTypeFilter('')
                    setStatusFilter('')
                  }}
                  className="text-sm text-teal-600 hover:text-teal-700 dark:text-teal-400 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Accounts Table */}
      {filteredAccounts.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-ink-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm || accountTypeFilter || statusFilter ? 'No accounts match your filters' : 'No savings accounts yet'}
          </p>
        </div>
      ) : (
        <DataTable columns={columns} data={filteredAccounts} title="savings-accounts" exportable />
      )}
    </div>
  )
}

export default SavingsAccounts
