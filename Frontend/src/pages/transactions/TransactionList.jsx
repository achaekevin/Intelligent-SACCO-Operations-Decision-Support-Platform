import { useState, useEffect } from 'react'
import { Search, Filter, Download, RotateCcw, Eye, Receipt, X } from 'lucide-react'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import PageHeader from '../../components/common/PageHeader'
import Card from '../../components/common/Card'
import DataTable from '../../components/tables/DataTable'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import { formatKES, formatDate } from '../../utils/format'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

const TransactionList = () => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [showReceipt, setShowReceipt] = useState(false)
  const [showReverseModal, setShowReverseModal] = useState(false)
  const [reversalReason, setReversalReason] = useState('')
  const [processingReversal, setProcessingReversal] = useState(false)

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const params = new URLSearchParams()
      if (typeFilter) params.append('type', typeFilter)
      if (dateFrom) params.append('startDate', dateFrom)
      if (dateTo) params.append('endDate', dateTo)

      const response = await axios.get(`${API_URL}/savings/transactions?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTransactions(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
      toast.error('Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  const handleReverseTransaction = async () => {
    if (!reversalReason.trim()) {
      toast.error('Please provide a reason for reversal')
      return
    }

    setProcessingReversal(true)
    try {
      const token = localStorage.getItem('accessToken')
      await axios.post(
        `${API_URL}/savings/transactions/${selectedTransaction.id}/reverse`,
        { reason: reversalReason },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success('Transaction reversed successfully')
      setShowReverseModal(false)
      setReversalReason('')
      setSelectedTransaction(null)
      fetchTransactions()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reverse transaction')
    } finally {
      setProcessingReversal(false)
    }
  }

  const printReceipt = () => {
    window.print()
  }

  // Filter transactions
  const filteredTransactions = transactions.filter(tx => {
    const reference = (tx.reference || '').toLowerCase()
    const memberName = tx.member 
      ? `${tx.member.firstName} ${tx.member.lastName}`.toLowerCase()
      : ''
    const accountNumber = tx.account?.accountNumber?.toLowerCase() || ''
    const search = searchTerm.toLowerCase()

    const matchesSearch = !searchTerm || 
      reference.includes(search) ||
      memberName.includes(search) ||
      accountNumber.includes(search)

    const matchesType = !typeFilter || tx.type === typeFilter
    const matchesStatus = !statusFilter || tx.status === statusFilter

    return matchesSearch && matchesType && matchesStatus
  })

  const columns = [
    {
      key: 'reference',
      label: 'Reference',
      render: (r) => (
        <div>
          <p className="font-mono text-xs font-semibold text-ink-800 dark:text-ink-50">{r.reference}</p>
          <p className="text-xs text-ink-400">{formatDate(r.createdAt)}</p>
        </div>
      )
    },
    {
      key: 'type',
      label: 'Type',
      render: (r) => (
        <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${
          r.type === 'deposit' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
          r.type === 'withdrawal' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
          r.type === 'transfer' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
          r.type === 'reversal' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
        }`}>
          {r.type}
        </span>
      )
    },
    {
      key: 'member',
      label: 'Member',
      render: (r) => (
        <div>
          <p className="text-sm font-medium">
            {r.member ? `${r.member.firstName} ${r.member.lastName}` : 'N/A'}
          </p>
          <p className="text-xs text-ink-400">{r.account?.accountNumber || 'N/A'}</p>
        </div>
      )
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (r) => (
        <span className={`font-semibold ${
          r.type === 'deposit' ? 'text-green-600 dark:text-green-400' :
          r.type === 'withdrawal' ? 'text-red-600 dark:text-red-400' :
          'text-ink-800 dark:text-ink-50'
        }`}>
          {r.type === 'withdrawal' ? '-' : '+'}{formatKES(r.amount)}
        </span>
      )
    },
    {
      key: 'balanceAfter',
      label: 'Balance After',
      render: (r) => formatKES(r.balanceAfter)
    },
    {
      key: 'paymentMethod',
      label: 'Method',
      render: (r) => <span className="capitalize text-sm">{r.paymentMethod?.replace('_', ' ')}</span>
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <Badge>{r.status}</Badge>
    },
    {
      key: 'actions',
      label: '',
      sortable: false,
      render: (r) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedTransaction(r)
              setShowReceipt(true)
            }}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
            title="View Receipt"
          >
            <Receipt size={16} />
          </button>
          {r.status === 'completed' && r.type !== 'reversal' && (
            <button
              onClick={() => {
                setSelectedTransaction(r)
                setShowReverseModal(true)
              }}
              className="text-orange-600 hover:text-orange-700 dark:text-orange-400"
              title="Reverse Transaction"
            >
              <RotateCcw size={16} />
            </button>
          )}
        </div>
      )
    }
  ]

  // Calculate statistics
  const totalDeposits = filteredTransactions
    .filter(tx => tx.type === 'deposit' && tx.status === 'completed')
    .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0)

  const totalWithdrawals = filteredTransactions
    .filter(tx => tx.type === 'withdrawal' && tx.status === 'completed')
    .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0)

  const totalReversals = filteredTransactions.filter(tx => tx.type === 'reversal').length

  if (loading) {
    return (
      <div>
        <PageHeader title="Transactions" subtitle="Loading..." />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Transaction Engine"
        subtitle={`${filteredTransactions.length} transactions • ${formatKES(totalDeposits - totalWithdrawals)} net flow`}
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <p className="text-xs text-ink-400 uppercase tracking-wide font-medium">Total Deposits</p>
          <p className="text-2xl font-display font-bold text-green-600 dark:text-green-400 mt-2">
            {formatKES(totalDeposits)}
          </p>
          <p className="text-xs text-ink-400 mt-1">
            {filteredTransactions.filter(tx => tx.type === 'deposit').length} transactions
          </p>
        </Card>

        <Card>
          <p className="text-xs text-ink-400 uppercase tracking-wide font-medium">Total Withdrawals</p>
          <p className="text-2xl font-display font-bold text-red-600 dark:text-red-400 mt-2">
            {formatKES(totalWithdrawals)}
          </p>
          <p className="text-xs text-ink-400 mt-1">
            {filteredTransactions.filter(tx => tx.type === 'withdrawal').length} transactions
          </p>
        </Card>

        <Card>
          <p className="text-xs text-ink-400 uppercase tracking-wide font-medium">Net Flow</p>
          <p className={`text-2xl font-display font-bold mt-2 ${
            totalDeposits - totalWithdrawals >= 0 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {formatKES(totalDeposits - totalWithdrawals)}
          </p>
        </Card>

        <Card>
          <p className="text-xs text-ink-400 uppercase tracking-wide font-medium">Reversals</p>
          <p className="text-2xl font-display font-bold text-orange-600 dark:text-orange-400 mt-2">
            {totalReversals}
          </p>
          <p className="text-xs text-ink-400 mt-1">
            {((totalReversals / filteredTransactions.length) * 100).toFixed(1)}% of total
          </p>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by reference, member name, or account..."
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
            {(typeFilter || statusFilter || dateFrom || dateTo) && (
              <span className="bg-teal-500 text-white text-xs px-2 py-0.5 rounded-full">
                {[typeFilter, statusFilter, dateFrom, dateTo].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Transaction Type
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value)
                    fetchTransactions()
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All Types</option>
                  <option value="deposit">Deposit</option>
                  <option value="withdrawal">Withdrawal</option>
                  <option value="transfer">Transfer</option>
                  <option value="reversal">Reversal</option>
                  <option value="interest">Interest</option>
                  <option value="fee">Fee</option>
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
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="reversed">Reversed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date From
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value)
                    fetchTransactions()
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date To
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value)
                    fetchTransactions()
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  setSearchTerm('')
                  setTypeFilter('')
                  setStatusFilter('')
                  setDateFrom('')
                  setDateTo('')
                  fetchTransactions()
                }}
                className="text-sm text-teal-600 hover:text-teal-700 dark:text-teal-400 font-medium"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Transactions Table */}
      <Card>
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {searchTerm || typeFilter || statusFilter ? 'No transactions match your filters' : 'No transactions yet'}
          </div>
        ) : (
          <DataTable 
            columns={columns} 
            data={filteredTransactions} 
            title="all-transactions" 
            exportable 
            pageSize={20}
          />
        )}
      </Card>

      {/* Receipt Modal */}
      {showReceipt && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-ink-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 print:p-0" id="receipt">
              {/* Receipt Header */}
              <div className="flex justify-between items-start mb-6 print:mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-ink-800 dark:text-ink-50">Amana SACCO</h2>
                  <p className="text-sm text-ink-400">Transaction Receipt</p>
                </div>
                <button
                  onClick={() => setShowReceipt(false)}
                  className="text-gray-500 hover:text-gray-700 print:hidden"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Receipt Content */}
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-ink-400">Reference Number</p>
                    <p className="font-mono font-semibold">{selectedTransaction.reference}</p>
                  </div>
                  <div>
                    <p className="text-ink-400">Date & Time</p>
                    <p className="font-semibold">{formatDate(selectedTransaction.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-ink-400">Transaction Type</p>
                    <p className="font-semibold capitalize">{selectedTransaction.type}</p>
                  </div>
                  <div>
                    <p className="text-ink-400">Status</p>
                    <p className="font-semibold capitalize">{selectedTransaction.status}</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-ink-400">Member</p>
                      <p className="font-semibold">
                        {selectedTransaction.member 
                          ? `${selectedTransaction.member.firstName} ${selectedTransaction.member.lastName}` 
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-ink-400">Account Number</p>
                      <p className="font-semibold">{selectedTransaction.account?.accountNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-ink-400">Amount</p>
                      <p className="text-2xl font-bold text-teal-600">{formatKES(selectedTransaction.amount)}</p>
                    </div>
                    <div>
                      <p className="text-ink-400">Balance After</p>
                      <p className="text-xl font-semibold">{formatKES(selectedTransaction.balanceAfter)}</p>
                    </div>
                    <div>
                      <p className="text-ink-400">Payment Method</p>
                      <p className="font-semibold capitalize">
                        {selectedTransaction.paymentMethod?.replace('_', ' ')}
                      </p>
                    </div>
                    {selectedTransaction.externalReference && (
                      <div>
                        <p className="text-ink-400">External Reference</p>
                        <p className="font-semibold">{selectedTransaction.externalReference}</p>
                      </div>
                    )}
                  </div>
                </div>

                {selectedTransaction.description && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <p className="text-ink-400 text-sm">Description</p>
                    <p className="font-medium">{selectedTransaction.description}</p>
                  </div>
                )}
              </div>

              {/* Receipt Footer */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 text-center text-xs text-ink-400">
                <p>This is a computer-generated receipt and does not require a signature</p>
                <p className="mt-1">© 2026 Amana SACCO. All rights reserved.</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6 print:hidden">
                <Button onClick={printReceipt} icon={Download}>
                  Print Receipt
                </Button>
                <Button variant="outline" onClick={() => setShowReceipt(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reversal Modal */}
      {showReverseModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-ink-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-ink-800 dark:text-ink-50 mb-4">
              Reverse Transaction
            </h3>

            <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded">
              <p className="text-sm text-orange-800 dark:text-orange-300">
                <strong>Transaction:</strong> {selectedTransaction.reference}
              </p>
              <p className="text-sm text-orange-800 dark:text-orange-300">
                <strong>Amount:</strong> {formatKES(selectedTransaction.amount)}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reason for Reversal <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reversalReason}
                onChange={(e) => setReversalReason(e.target.value)}
                rows="4"
                placeholder="Explain why this transaction needs to be reversed..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleReverseTransaction}
                loading={processingReversal}
                disabled={!reversalReason.trim()}
                variant="danger"
              >
                {processingReversal ? 'Reversing...' : 'Confirm Reversal'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowReverseModal(false)
                  setReversalReason('')
                  setSelectedTransaction(null)
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TransactionList
