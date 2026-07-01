import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, User, Calendar, TrendingUp } from 'lucide-react'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import PageHeader from '../../components/common/PageHeader'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import DataTable from '../../components/tables/DataTable'
import Badge from '../../components/common/Badge'
import { formatKES, formatDate } from '../../utils/format'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

const AccountDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [account, setAccount] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingTransactions, setLoadingTransactions] = useState(true)

  useEffect(() => {
    fetchAccountDetails()
    fetchTransactions()
  }, [id])

  const fetchAccountDetails = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await axios.get(`${API_URL}/savings/accounts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setAccount(response.data.data)
    } catch (error) {
      console.error('Failed to fetch account:', error)
      toast.error('Failed to load account details')
    } finally {
      setLoading(false)
    }
  }

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await axios.get(`${API_URL}/savings/accounts/${id}/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTransactions(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    } finally {
      setLoadingTransactions(false)
    }
  }

  const downloadStatement = () => {
    toast.success('Statement download feature coming soon!')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  if (!account) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Account not found</p>
      </div>
    )
  }

  const getAccountTypeLabel = (type) => {
    const labels = {
      ordinary: 'Ordinary Savings',
      share_capital: 'Share Capital',
      fixed_deposit: 'Fixed Deposit'
    }
    return labels[type] || type
  }

  const txColumns = [
    {
      key: 'reference',
      label: 'Reference',
      render: (r) => r.reference || 'N/A'
    },
    {
      key: 'type',
      label: 'Type',
      render: (r) => (
        <span className={`capitalize ${
          r.type === 'deposit' ? 'text-green-600 dark:text-green-400' :
          r.type === 'withdrawal' ? 'text-red-600 dark:text-red-400' :
          'text-blue-600 dark:text-blue-400'
        }`}>
          {r.type}
        </span>
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
      render: (r) => <span className="capitalize">{r.paymentMethod?.replace('_', ' ')}</span>
    },
    {
      key: 'description',
      label: 'Description',
      render: (r) => r.description || 'N/A'
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (r) => formatDate(r.createdAt)
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <Badge>{r.status}</Badge>
    },
  ]

  const totalDeposits = transactions
    .filter(tx => tx.type === 'deposit')
    .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0)

  const totalWithdrawals = transactions
    .filter(tx => tx.type === 'withdrawal')
    .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0)

  return (
    <div>
      <button 
        onClick={() => navigate('/savings/accounts')} 
        className="flex items-center gap-1.5 text-sm text-ink-500 dark:text-ink-300 hover:text-teal-600 mb-4"
      >
        <ArrowLeft size={15} /> Back to accounts
      </button>

      <PageHeader
        title={account.accountNumber}
        subtitle={`${getAccountTypeLabel(account.accountType)} Account`}
        actions={
          <Button icon={Download} onClick={downloadStatement} variant="outline">
            Download Statement
          </Button>
        }
      />

      {/* Account Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-ink-400 uppercase tracking-wide font-medium">Current Balance</p>
              <p className="text-3xl font-display font-bold text-ink-800 dark:text-ink-50 mt-2">
                {formatKES(account.balance)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
              <TrendingUp className="text-teal-600 dark:text-teal-400" size={20} />
            </div>
          </div>
        </Card>

        <Card>
          <p className="text-xs text-ink-400 uppercase tracking-wide font-medium">Total Deposits</p>
          <p className="text-2xl font-display font-bold text-green-600 dark:text-green-400 mt-2">
            {formatKES(totalDeposits)}
          </p>
          <p className="text-xs text-ink-400 mt-1">{transactions.filter(tx => tx.type === 'deposit').length} transactions</p>
        </Card>

        <Card>
          <p className="text-xs text-ink-400 uppercase tracking-wide font-medium">Total Withdrawals</p>
          <p className="text-2xl font-display font-bold text-red-600 dark:text-red-400 mt-2">
            {formatKES(totalWithdrawals)}
          </p>
          <p className="text-xs text-ink-400 mt-1">{transactions.filter(tx => tx.type === 'withdrawal').length} transactions</p>
        </Card>
      </div>

      {/* Account Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200 mb-4 flex items-center gap-2">
            <User size={16} />
            Account Holder
          </h3>
          {account.member && (
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-ink-400">Name:</span>
                <p className="font-medium text-ink-800 dark:text-ink-50">
                  {account.member.firstName} {account.member.lastName}
                </p>
              </div>
              <div>
                <span className="text-ink-400">Member Number:</span>
                <p className="font-medium text-ink-800 dark:text-ink-50">{account.member.memberNumber}</p>
              </div>
              <div>
                <span className="text-ink-400">Email:</span>
                <p className="font-medium text-ink-800 dark:text-ink-50">{account.member.email || 'N/A'}</p>
              </div>
              <div>
                <span className="text-ink-400">Phone:</span>
                <p className="font-medium text-ink-800 dark:text-ink-50">{account.member.phone || 'N/A'}</p>
              </div>
            </div>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200 mb-4 flex items-center gap-2">
            <Calendar size={16} />
            Account Information
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-ink-400">Account Type:</span>
              <p className="font-medium text-ink-800 dark:text-ink-50 capitalize">
                {getAccountTypeLabel(account.accountType)}
              </p>
            </div>
            <div>
              <span className="text-ink-400">Status:</span>
              <p className="mt-1">
                <Badge>{account.status}</Badge>
              </p>
            </div>
            <div>
              <span className="text-ink-400">Interest Rate:</span>
              <p className="font-medium text-ink-800 dark:text-ink-50">{account.interestRate}% p.a.</p>
            </div>
            <div>
              <span className="text-ink-400">Minimum Balance:</span>
              <p className="font-medium text-ink-800 dark:text-ink-50">{formatKES(account.minimumBalance)}</p>
            </div>
            <div>
              <span className="text-ink-400">Opened On:</span>
              <p className="font-medium text-ink-800 dark:text-ink-50">{formatDate(account.createdAt)}</p>
            </div>
            <div>
              <span className="text-ink-400">Last Transaction:</span>
              <p className="font-medium text-ink-800 dark:text-ink-50">
                {account.lastTransactionAt ? formatDate(account.lastTransactionAt) : 'No transactions'}
              </p>
            </div>
            {account.accountType === 'fixed_deposit' && (
              <>
                <div>
                  <span className="text-ink-400">Maturity Date:</span>
                  <p className="font-medium text-ink-800 dark:text-ink-50">
                    {account.maturityDate ? formatDate(account.maturityDate) : 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-ink-400">Maturity Amount:</span>
                  <p className="font-medium text-ink-800 dark:text-ink-50">
                    {formatKES(account.maturityAmount || 0)}
                  </p>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <h3 className="text-lg font-semibold text-ink-800 dark:text-ink-50 mb-4">Transaction History</h3>
        {loadingTransactions ? (
          <div className="text-center py-8">Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No transactions yet
          </div>
        ) : (
          <DataTable 
            columns={txColumns} 
            data={transactions} 
            title="account-transactions" 
            pageSize={20}
            exportable
          />
        )}
      </Card>
    </div>
  )
}

export default AccountDetails
