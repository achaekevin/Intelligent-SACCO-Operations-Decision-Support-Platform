import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  Wallet, Search, DollarSign, Smartphone, Building,
  TrendingUp, FileText, Printer, CheckCircle, AlertCircle, User
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { formatKES, formatDateTime, formatDate } from '../../utils/format';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const DepositManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const receiptRef = useRef(null);

  // Member search
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);

  // Account selection
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);

  // Deposit form
  const [depositData, setDepositData] = useState({
    amount: '',
    paymentMethod: 'cash',
    externalReference: '',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Receipt
  const [receipt, setReceipt] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const paymentMethods = [
    { value: 'cash', label: 'Cash', icon: DollarSign },
    { value: 'mpesa', label: 'M-Pesa', icon: Smartphone },
    { value: 'bank_transfer', label: 'Bank Transfer', icon: Building },
    { value: 'cheque', label: 'Cheque', icon: FileText },
  ];

  const handleSearchMember = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.error('Please enter a search term');
      return;
    }

    setSearching(true);
    setSelectedMember(null);
    setSelectedAccount(null);
    setAccounts([]);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        `${API_URL}/members/search`,
        {
          params: { q: searchQuery.trim() },
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const results = response.data.data || [];
      setMembers(results);

      if (results.length === 0) {
        toast.error('No members found');
      } else if (results.length === 1) {
        // Auto-select if only one result
        handleSelectMember(results[0]);
      }
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Search failed');
      setMembers([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectMember = async (member) => {
    setSelectedMember(member);
    setSelectedAccount(null);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        `${API_URL}/savings/members/${member.id}/accounts`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const activeAccounts = (response.data.data || []).filter(acc => acc.status === 'active');
      setAccounts(activeAccounts);

      if (activeAccounts.length === 0) {
        toast.error('No active savings accounts found for this member');
      }
    } catch (error) {
      console.error('Failed to load accounts:', error);
      toast.error('Failed to load member accounts');
      setAccounts([]);
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();

    if (!selectedAccount) {
      toast.error('Please select an account');
      return;
    }

    if (!depositData.amount || parseFloat(depositData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (depositData.paymentMethod === 'mpesa' && !depositData.externalReference) {
      toast.error('Please enter M-Pesa transaction code');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        `${API_URL}/savings/deposit`,
        {
          accountId: selectedAccount.id,
          amount: parseFloat(depositData.amount),
          paymentMethod: depositData.paymentMethod,
          externalReference: depositData.externalReference || null,
          description: depositData.description || `${depositData.paymentMethod} deposit`
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Deposit processed successfully!');

      // Load receipt
      const transactionId = response.data.data.transaction.id;
      await loadReceipt(transactionId);

      // Reset form
      setDepositData({
        amount: '',
        paymentMethod: 'cash',
        externalReference: '',
        description: ''
      });

      // Update account balance
      const updatedAccount = { ...selectedAccount, balance: response.data.data.account.balance };
      setSelectedAccount(updatedAccount);
      setAccounts(accounts.map(acc => acc.id === updatedAccount.id ? updatedAccount : acc));
    } catch (error) {
      console.error('Deposit failed:', error);
      toast.error(error.response?.data?.message || 'Deposit failed');
    } finally {
      setSubmitting(false);
    }
  };

  const loadReceipt = async (transactionId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        `${API_URL}/savings/transactions/${transactionId}/receipt`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setReceipt(response.data.data);
      setShowReceipt(true);
    } catch (error) {
      console.error('Failed to load receipt:', error);
      toast.error('Failed to load receipt');
    }
  };

  const handlePrintReceipt = () => {
    const printWindow = window.open('', '_blank');
    const receiptHtml = receiptRef.current?.innerHTML;

    if (printWindow && receiptHtml) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Receipt - ${receipt?.receipt?.reference}</title>
            <style>
              body {
                font-family: 'Courier New', monospace;
                padding: 20px;
                max-width: 400px;
                margin: 0 auto;
              }
              .receipt-header {
                text-align: center;
                border-bottom: 2px dashed #000;
                padding-bottom: 10px;
                margin-bottom: 15px;
              }
              .receipt-title {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 5px;
              }
              .receipt-row {
                display: flex;
                justify-content: space-between;
                padding: 5px 0;
              }
              .receipt-label {
                font-weight: bold;
              }
              .receipt-amount {
                font-size: 20px;
                font-weight: bold;
                text-align: center;
                padding: 15px 0;
                border-top: 2px dashed #000;
                border-bottom: 2px dashed #000;
                margin: 15px 0;
              }
              .receipt-footer {
                text-align: center;
                margin-top: 20px;
                padding-top: 10px;
                border-top: 2px dashed #000;
                font-size: 12px;
              }
              @media print {
                body { padding: 0; }
              }
            </style>
          </head>
          <body>
            ${receiptHtml}
            <script>window.print(); window.close();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleNewDeposit = () => {
    setShowReceipt(false);
    setReceipt(null);
    setSearchQuery('');
    setMembers([]);
    setSelectedMember(null);
    setSelectedAccount(null);
    setAccounts([]);
    setDepositData({
      amount: '',
      paymentMethod: 'cash',
      externalReference: '',
      description: ''
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Deposit Management"
        subtitle="Process deposits to savings accounts"
      />

      {!showReceipt ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Member Search */}
          <Card>
            <div className="p-4 sm:p-6 border-b border-ink-200 dark:border-ink-700">
              <h3 className="font-semibold text-ink-900 dark:text-ink-100 flex items-center gap-2">
                <User size={20} />
                1. Find Member
              </h3>
            </div>
            <div className="p-4 sm:p-6">
              <form onSubmit={handleSearchMember} className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Member number, name, or phone..."
                    className="flex-1 px-4 py-2.5 border border-ink-300 dark:border-ink-600 rounded-lg bg-white dark:bg-ink-900 text-ink-900 dark:text-ink-100 focus:ring-2 focus:ring-teal-500"
                  />
                  <Button type="submit" loading={searching} icon={Search}>
                    Search
                  </Button>
                </div>
              </form>

              {members.length > 0 && !selectedMember && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-ink-600 dark:text-ink-400 mb-2">
                    {members.length} member{members.length !== 1 ? 's' : ''} found:
                  </p>
                  {members.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => handleSelectMember(member)}
                      className="w-full p-3 bg-ink-50 dark:bg-ink-900/50 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-900 transition-colors text-left"
                    >
                      <div className="font-medium text-ink-900 dark:text-ink-100">
                        {member.fullName}
                      </div>
                      <div className="text-xs text-ink-500 dark:text-ink-400">
                        {member.memberNumber} • {member.phone}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {selectedMember && (
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="text-green-600" size={20} />
                    <span className="font-semibold text-green-900 dark:text-green-100">
                      Member Selected
                    </span>
                  </div>
                  <div className="text-sm text-green-800 dark:text-green-200">
                    <div className="font-medium">{selectedMember.fullName}</div>
                    <div className="text-xs">{selectedMember.memberNumber}</div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedMember(null);
                      setSelectedAccount(null);
                      setAccounts([]);
                    }}
                    className="mt-2 text-xs text-green-700 dark:text-green-300 hover:underline"
                  >
                    Change member
                  </button>
                </div>
              )}

              {/* Account Selection */}
              {accounts.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-ink-900 dark:text-ink-100 mb-3 flex items-center gap-2">
                    <Wallet size={18} />
                    2. Select Account
                  </h4>
                  <div className="space-y-2">
                    {accounts.map((account) => (
                      <button
                        key={account.id}
                        onClick={() => setSelectedAccount(account)}
                        className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                          selectedAccount?.id === account.id
                            ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                            : 'border-ink-200 dark:border-ink-700 hover:border-teal-300 dark:hover:border-teal-700'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium text-ink-900 dark:text-ink-100">
                              {account.accountType.replace(/_/g, ' ').toUpperCase()}
                            </div>
                            <div className="text-xs text-ink-500 dark:text-ink-400 font-mono">
                              {account.accountNumber}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-ink-900 dark:text-ink-100">
                              {formatKES(account.balance)}
                            </div>
                            <div className="text-xs text-ink-500 dark:text-ink-400">
                              Balance
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Deposit Form */}
          <Card>
            <div className="p-4 sm:p-6 border-b border-ink-200 dark:border-ink-700">
              <h3 className="font-semibold text-ink-900 dark:text-ink-100 flex items-center gap-2">
                <DollarSign size={20} />
                3. Deposit Details
              </h3>
            </div>
            <div className="p-4 sm:p-6">
              {!selectedAccount ? (
                <div className="text-center py-12 text-ink-500">
                  <AlertCircle className="mx-auto mb-3 text-ink-300" size={48} />
                  <p>Select a member and account to continue</p>
                </div>
              ) : (
                <form onSubmit={handleDeposit} className="space-y-6">
                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-semibold text-ink-700 dark:text-ink-300 mb-2">
                      Deposit Amount <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={depositData.amount}
                      onChange={(e) => setDepositData({ ...depositData, amount: e.target.value })}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required
                      className="w-full px-4 py-3 border border-ink-300 dark:border-ink-600 rounded-lg bg-white dark:bg-ink-900 text-ink-900 dark:text-ink-100 text-lg font-semibold focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-sm font-semibold text-ink-700 dark:text-ink-300 mb-2">
                      Payment Method <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {paymentMethods.map((method) => (
                        <button
                          key={method.value}
                          type="button"
                          onClick={() => setDepositData({ ...depositData, paymentMethod: method.value })}
                          className={`p-3 rounded-lg border-2 transition-all flex items-center gap-2 ${
                            depositData.paymentMethod === method.value
                              ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300'
                              : 'border-ink-200 dark:border-ink-700 hover:border-teal-300'
                          }`}
                        >
                          <method.icon size={18} />
                          <span className="text-sm font-medium">{method.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* External Reference */}
                  {(depositData.paymentMethod === 'mpesa' || depositData.paymentMethod === 'bank_transfer' || depositData.paymentMethod === 'cheque') && (
                    <div>
                      <label className="block text-sm font-semibold text-ink-700 dark:text-ink-300 mb-2">
                        {depositData.paymentMethod === 'mpesa' && 'M-Pesa Transaction Code'}
                        {depositData.paymentMethod === 'bank_transfer' && 'Bank Reference Number'}
                        {depositData.paymentMethod === 'cheque' && 'Cheque Number'}
                        {depositData.paymentMethod === 'mpesa' && <span className="text-red-500"> *</span>}
                      </label>
                      <input
                        type="text"
                        value={depositData.externalReference}
                        onChange={(e) => setDepositData({ ...depositData, externalReference: e.target.value })}
                        placeholder={
                          depositData.paymentMethod === 'mpesa' ? 'e.g., SH12AB3C4D' :
                          depositData.paymentMethod === 'bank_transfer' ? 'e.g., TXN123456' :
                          'e.g., CHQ001234'
                        }
                        required={depositData.paymentMethod === 'mpesa'}
                        className="w-full px-4 py-2.5 border border-ink-300 dark:border-ink-600 rounded-lg bg-white dark:bg-ink-900 text-ink-900 dark:text-ink-100 focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-ink-700 dark:text-ink-300 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={depositData.description}
                      onChange={(e) => setDepositData({ ...depositData, description: e.target.value })}
                      placeholder="Add notes about this deposit..."
                      rows={3}
                      className="w-full px-4 py-2.5 border border-ink-300 dark:border-ink-600 rounded-lg bg-white dark:bg-ink-900 text-ink-900 dark:text-ink-100 focus:ring-2 focus:ring-teal-500 resize-none"
                    />
                  </div>

                  {/* Summary */}
                  {depositData.amount && parseFloat(depositData.amount) > 0 && (
                    <div className="p-4 bg-gradient-to-r from-teal-50 to-green-50 dark:from-teal-900/20 dark:to-green-900/20 rounded-xl border border-teal-200 dark:border-teal-800">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-ink-600 dark:text-ink-400">Account:</span>
                          <span className="font-medium text-ink-900 dark:text-ink-100">
                            {selectedAccount.accountNumber}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-ink-600 dark:text-ink-400">Current Balance:</span>
                          <span className="font-medium text-ink-900 dark:text-ink-100">
                            {formatKES(selectedAccount.balance)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-ink-600 dark:text-ink-400">Deposit Amount:</span>
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            +{formatKES(parseFloat(depositData.amount))}
                          </span>
                        </div>
                        <div className="pt-2 border-t border-teal-200 dark:border-teal-700">
                          <div className="flex justify-between">
                            <span className="font-semibold text-ink-700 dark:text-ink-300">New Balance:</span>
                            <span className="text-xl font-bold text-teal-600 dark:text-teal-400">
                              {formatKES(parseFloat(selectedAccount.balance) + parseFloat(depositData.amount))}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    loading={submitting}
                    disabled={!depositData.amount || parseFloat(depositData.amount) <= 0}
                    icon={CheckCircle}
                    className="w-full"
                  >
                    Process Deposit
                  </Button>
                </form>
              )}
            </div>
          </Card>
        </div>
      ) : (
        /* Receipt View */
        <Card className="max-w-3xl mx-auto">
          <div className="p-6 border-b border-ink-200 dark:border-ink-700 flex items-center justify-between">
            <h3 className="font-semibold text-ink-900 dark:text-ink-100">Transaction Receipt</h3>
            <div className="flex gap-2">
              <Button variant="outline" icon={Printer} onClick={handlePrintReceipt}>
                Print
              </Button>
              <Button onClick={handleNewDeposit}>
                New Deposit
              </Button>
            </div>
          </div>

          <div className="p-8">
            <div ref={receiptRef} className="max-w-md mx-auto">
              {/* Receipt Header */}
              <div className="text-center border-b-2 border-dashed border-ink-300 pb-4 mb-6">
                <div className="text-2xl font-bold text-ink-900 dark:text-ink-100 mb-2">
                  {receipt?.organization?.name || 'Amana SACCO'}
                </div>
                {receipt?.organization?.address && (
                  <div className="text-sm text-ink-600 dark:text-ink-400">
                    {receipt.organization.address}
                  </div>
                )}
                {receipt?.organization?.phone && (
                  <div className="text-sm text-ink-600 dark:text-ink-400">
                    Tel: {receipt.organization.phone}
                  </div>
                )}
                {receipt?.organization?.email && (
                  <div className="text-sm text-ink-600 dark:text-ink-400">
                    {receipt.organization.email}
                  </div>
                )}
              </div>

              {/* Receipt Type */}
              <div className="text-center mb-6">
                <div className="inline-block px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-lg font-semibold">
                  {receipt?.receipt?.type.toUpperCase()} RECEIPT
                </div>
              </div>

              {/* Receipt Details */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between py-2 border-b border-ink-200 dark:border-ink-700">
                  <span className="text-ink-600 dark:text-ink-400">Receipt No:</span>
                  <span className="font-mono font-semibold text-ink-900 dark:text-ink-100">
                    {receipt?.receipt?.reference}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-ink-200 dark:border-ink-700">
                  <span className="text-ink-600 dark:text-ink-400">Date & Time:</span>
                  <span className="font-medium text-ink-900 dark:text-ink-100">
                    {formatDateTime(receipt?.receipt?.date)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-ink-200 dark:border-ink-700">
                  <span className="text-ink-600 dark:text-ink-400">Member:</span>
                  <span className="font-medium text-ink-900 dark:text-ink-100">
                    {receipt?.member?.name}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-ink-200 dark:border-ink-700">
                  <span className="text-ink-600 dark:text-ink-400">Member No:</span>
                  <span className="font-mono text-ink-900 dark:text-ink-100">
                    {receipt?.member?.memberNumber}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-ink-200 dark:border-ink-700">
                  <span className="text-ink-600 dark:text-ink-400">Account:</span>
                  <span className="font-mono text-ink-900 dark:text-ink-100">
                    {receipt?.account?.accountNumber}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-ink-200 dark:border-ink-700">
                  <span className="text-ink-600 dark:text-ink-400">Payment Method:</span>
                  <span className="font-medium text-ink-900 dark:text-ink-100 uppercase">
                    {receipt?.receipt?.paymentMethod?.replace(/_/g, ' ')}
                  </span>
                </div>
                {receipt?.receipt?.externalReference && (
                  <div className="flex justify-between py-2 border-b border-ink-200 dark:border-ink-700">
                    <span className="text-ink-600 dark:text-ink-400">Reference:</span>
                    <span className="font-mono text-ink-900 dark:text-ink-100">
                      {receipt.receipt.externalReference}
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b border-ink-200 dark:border-ink-700">
                  <span className="text-ink-600 dark:text-ink-400">Teller:</span>
                  <span className="font-medium text-ink-900 dark:text-ink-100">
                    {receipt?.teller?.name}
                  </span>
                </div>
              </div>

              {/* Amount */}
              <div className="text-center py-6 border-t-2 border-b-2 border-dashed border-ink-300 my-6">
                <div className="text-sm text-ink-600 dark:text-ink-400 mb-1">AMOUNT</div>
                <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                  {formatKES(receipt?.receipt?.amount)}
                </div>
              </div>

              {/* Balance */}
              <div className="flex justify-between py-2 mb-6">
                <span className="font-semibold text-ink-700 dark:text-ink-300">New Balance:</span>
                <span className="text-xl font-bold text-teal-600 dark:text-teal-400">
                  {formatKES(receipt?.receipt?.balanceAfter)}
                </span>
              </div>

              {/* Footer */}
              <div className="text-center pt-6 border-t-2 border-dashed border-ink-300">
                <div className="text-sm text-ink-600 dark:text-ink-400 mb-2">
                  Thank you for banking with us!
                </div>
                <div className="text-xs text-ink-500 dark:text-ink-500">
                  This is a system-generated receipt
                </div>
                <div className="text-xs text-ink-500 dark:text-ink-500 mt-1">
                  Printed on {formatDateTime(new Date())}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DepositManagement;
