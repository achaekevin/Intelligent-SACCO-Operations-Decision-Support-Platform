import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import { ArrowDownCircle } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import Card from '../../components/common/Card'
import { FormField, TextInput, SelectInput } from '../../components/forms/FormField'
import Button from '../../components/common/Button'
import DataTable from '../../components/tables/DataTable'
import Badge from '../../components/common/Badge'
import { formatKES, formatDate } from '../../utils/format'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

const schema = yup.object({
  accountId: yup.string().required('Please select an account'),
  amount: yup.number().positive('Amount must be positive').required('Amount is required'),
  paymentMethod: yup.string().required('Payment method is required'),
  externalReference: yup.string(),
  description: yup.string(),
})

const Deposits = () => {
  const [accounts, setAccounts] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loadingAccounts, setLoadingAccounts] = useState(true)
  const [loadingTransactions, setLoadingTransactions] = useState(true)
  const [searchMember, setSearchMember] = useState('')
  const [filteredAccounts, setFilteredAccounts] = useState([])

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, watch } = useForm({
    resolver: yupResolver(schema),
  })

  const selectedAccountId = watch('accountId')
  const selectedAccount = accounts.find(acc => acc.id === selectedAccountId)

  useEffect(() => {
    fetchAccounts()
    fetchRecentTransactions()
  }, [])

  useEffect(() => {
    if (searchMember) {
      const filtered = accounts.filter(acc => {
        const memberName = acc.member 
          ? `${acc.member.firstName} ${acc.member.lastName}`.toLowerCase()
          : ''
        const accountNumber = (acc.accountNumber || '').toLowerCase()
        const search = searchMember.toLowerCase()
        return memberName.includes(search) || accountNumber.includes(search)
      })
      setFilteredAccounts(filtered)
    } else {
      setFilteredAccounts(accounts)
    }
  }, [searchMember, accounts])

  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await axios.get(`${API_URL}/savings/accounts?status=active`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setAccounts(response.data.data || [])
      setFilteredAccounts(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch accounts:', error)
    } finally {
      setLoadingAccounts(false)
    }
  }

  const fetchRecentTransactions = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await axios.get(`${API_URL}/savings/transactions?type=deposit&limit=20`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTransactions(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    } finally {
      setLoadingTransactions(false)
    }
  }

  const onSubmit = async (data) => {
    try {
      const token = localStorage.getItem('accessToken')
      await axios.post(
        `${API_URL}/savings/deposit`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success('Deposit processed successfully!')
      reset()
      setSearchMember('')
      fetchAccounts()
      fetchRecentTransactions()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to process deposit')
    }
  }

  const txColumns = [
    {
      key: 'reference',
      label: 'Reference',
      render: (r) => r.reference || 'N/A'
    },
    {
      key: 'account',
      label: 'Account',
      render: (r) => (
        <div>
          <p className="font-medium text-sm">{r.account?.accountNumber || 'N/A'}</p>
          <p className="text-xs text-ink-400">
            {r.member ? `${r.member.firstName} ${r.member.lastName}` : 'N/A'}
          </p>
        </div>
      )
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (r) => (
        <span className="font-semibold text-green-600 dark:text-green-400">
          {formatKES(r.amount)}
        </span>
      )
    },
    {
      key: 'paymentMethod',
      label: 'Method',
      render: (r) => <span className="capitalize">{r.paymentMethod}</span>
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

  return (
    <div>
      <PageHeader
        title="Deposits"
        subtitle="Record member deposits to savings accounts"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Deposit Form */}
        <Card>
          <h3 className="text-lg font-semibold text-ink-800 dark:text-ink-50 mb-4 flex items-center gap-2">
            <ArrowDownCircle className="text-green-600" size={20} />
            Process Deposit
          </h3>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Member/Account Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Member or Account
              </label>
              <input
                type="text"
                value={searchMember}
                onChange={(e) => setSearchMember(e.target.value)}
                placeholder="Search by name or account number..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Account Selection */}
            <FormField label="Account" error={errors.accountId} required>
              <SelectInput register={register} name="accountId" error={errors.accountId}>
                <option value="">Select account</option>
                {filteredAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.accountNumber} - {acc.member ? `${acc.member.firstName} ${acc.member.lastName}` : 'N/A'} ({formatKES(acc.balance)})
                  </option>
                ))}
              </SelectInput>
            </FormField>

            {/* Current Balance Display */}
            {selectedAccount && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <span className="font-medium">Current Balance:</span> {formatKES(selectedAccount.balance)}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Account Type: <span className="capitalize">{selectedAccount.accountType?.replace('_', ' ')}</span>
                </p>
              </div>
            )}

            {/* Amount */}
            <FormField label="Amount (KES)" error={errors.amount} required>
              <TextInput 
                register={register} 
                name="amount" 
                type="number" 
                step="0.01"
                placeholder="e.g. 5000" 
                error={errors.amount} 
              />
            </FormField>

            {/* Payment Method */}
            <FormField label="Payment Method" error={errors.paymentMethod} required>
              <SelectInput register={register} name="paymentMethod" error={errors.paymentMethod}>
                <option value="">Select method</option>
                <option value="cash">Cash</option>
                <option value="mpesa">M-Pesa</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
              </SelectInput>
            </FormField>

            {/* External Reference */}
            <FormField label="Reference (Optional)" error={errors.externalReference}>
              <TextInput 
                register={register} 
                name="externalReference" 
                placeholder="e.g. M-Pesa code, cheque number"
                error={errors.externalReference} 
              />
            </FormField>

            {/* Description */}
            <FormField label="Description (Optional)" error={errors.description}>
              <textarea
                {...register('description')}
                rows="2"
                placeholder="Add any notes..."
                className="w-full bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-600 rounded-lg px-3 py-2 text-sm text-ink-800 dark:text-ink-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </FormField>

            {/* Submit Button */}
            <Button type="submit" loading={isSubmitting} className="w-full">
              {isSubmitting ? 'Processing...' : 'Process Deposit'}
            </Button>
          </form>
        </Card>

        {/* Quick Stats */}
        <div className="space-y-4">
          <Card>
            <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200 mb-3">Today's Deposits</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-ink-400">Total Amount</span>
                <span className="text-xl font-bold text-green-600 dark:text-green-400">
                  {formatKES(
                    transactions
                      .filter(tx => {
                        const today = new Date().toDateString()
                        return new Date(tx.createdAt).toDateString() === today
                      })
                      .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0)
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-ink-400">Number of Deposits</span>
                <span className="text-lg font-semibold text-ink-800 dark:text-ink-50">
                  {transactions.filter(tx => {
                    const today = new Date().toDateString()
                    return new Date(tx.createdAt).toDateString() === today
                  }).length}
                </span>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200 mb-3">Payment Methods Today</h3>
            <div className="space-y-2">
              {['cash', 'mpesa', 'bank_transfer', 'cheque'].map(method => {
                const count = transactions.filter(tx => {
                  const today = new Date().toDateString()
                  return new Date(tx.createdAt).toDateString() === today && tx.paymentMethod === method
                }).length
                return count > 0 ? (
                  <div key={method} className="flex justify-between items-center">
                    <span className="text-sm text-ink-400 capitalize">{method.replace('_', ' ')}</span>
                    <span className="text-sm font-medium text-ink-800 dark:text-ink-50">{count}</span>
                  </div>
                ) : null
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Transactions */}
      <Card>
        <h3 className="text-lg font-semibold text-ink-800 dark:text-ink-50 mb-4">Recent Deposits</h3>
        {loadingTransactions ? (
          <div className="text-center py-8">Loading transactions...</div>
        ) : (
          <DataTable 
            columns={txColumns} 
            data={transactions} 
            title="recent-deposits" 
            pageSize={10}
            exportable={false}
          />
        )}
      </Card>
    </div>
  )
}

export default Deposits
