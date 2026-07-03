import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  ArrowRightLeft, Search, User, Building, DollarSign,
  CheckCircle, AlertCircle, Printer, FileText
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { formatKES, formatDateTime } from '../../utils/format';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const FundTransfer = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const receiptRef = useRef(null);

  // Search states
  const [senderSearch, setSenderSearch] = useState('');
  const [receiverSearch, setReceiverSearch] = useState('');
  const [searchingSender, setSearchingSender] = useState(false);
  const [searchingReceiver, setSearchingReceiver] = useState(false);

  // Member selection
  const [senderMembers, setSenderMembers] = useState([]);
  const [receiverMembers, setReceiverMembers] = useState([]);
  const [selectedSender, setSelectedSender] = useState(null);
  const [selectedReceiver, setSelectedReceiver] = useState(null);

  // Account selection
  const [senderAccounts, setSenderAccounts] = useState([]);
  const [receiverAccounts, setReceiverAccounts] = useState([]);
  const [selectedSenderAccount, setSelectedSenderAccount] = useState(null);
  const [selectedReceiverAccount, setSelectedReceiverAccount] = useState(null);

  // Transfer data
  const [transferData, setTransferData] = useState({
    amount: '',
    description: '',
    transferFee: 0
  });
  const [submitting, setSubmitting] = useState(false);
  const [transferResult, setTransferResult] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const TRANSFER_FEE_RATE = 0.001; // 0.1% transfer fee
  const MIN_TRANSFER_FEE = 10; // Minimum KES 10
  const MAX_TRANSFER_FEE = 500; // Maximum KES 500

  const calculateTransferFee = (amount) => {
    if (!amount || parseFloat(amount) <= 0) return 0;
    const fee = parseFloat(amount) * TRANSFER_FEE_RATE;
    return Math.max(MIN_TRANSFER_FEE, Math.min(fee, MAX_TRANSFER_FEE));
  };

  const handleSearchMember = async (query, type) => {
    if (!query.trim()) {
      toast.error('Please enter a search term');
      return;
    }

    const setSearching = type === 'sender' ? setSearchingSender : setSearchingReceiver;
    const setMembers = type === 'sender' ? setSenderMembers : setReceiverMembers;

    setSearching(true);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_URL}/members/search`, {
        params: { q: query.trim() },
        headers: { Authorization: `Bearer ${token}` }
      });

      const results = response.data.data || [];
      setMembers(results);

      if (results.length === 0) {
        toast.error('No members found');
      }
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Search failed');
      setMembers([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectMember = async (member, type) => {
    if (type === 'sender') {
      setSelectedSender(member);
      setSelectedSenderAccount(null);
    } else {
      setSelectedReceiver(member);
      setSelectedReceiverAccount(null);
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        `${API_URL}/savings/members/${member.id}/accounts`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const activeAccounts = (response.data.data || []).filter(acc => acc.status === 'active');
      
      if (type === 'sender') {
        setSenderAccounts(activeAccounts);
      } else {
        setReceiverAccounts(activeAccounts);
      }

      if (activeAccounts.length === 0) {
        toast.error('No active savings accounts found');
      }
    } catch (error) {
      console.error('Failed to load accounts:', error);
      toast.error('Failed to load accounts');
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();

    if (!selectedSenderAccount || !selectedReceiverAccount) {
      toast.error('Please select both sender and receiver accounts');
      return;
    }

    if (selectedSenderAccount.id === selectedReceiverAccount.id) {
      toast.error('Cannot transfer to the same account');
      return;
    }

    const amount = parseFloat(transferData.amount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const totalDeduction = amount + transferData.transferFee;
    if (totalDeduction > parseFloat(selectedSenderAccount.balance)) {
      toast.error('Insufficient balance (including transfer fee)');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        `${API_URL}/savings/transfer`,
        {
          fromAccountId: selectedSenderAccount.id,
          toAccountId: selectedReceiverAccount.id,
          amount: amount,
          description: transferData.description || `Transfer from ${selectedSenderAccount.accountNumber} to ${selectedReceiverAccount.accountNumber}`
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Transfer completed successfully!');

      setTransferResult({
        reference: response.data.data.reference,
        amount: amount,
        fee: transferData.transferFee,
        totalDeducted: totalDeduction,
        sender: {
          name: selectedSender.fullName,
          memberNumber: selectedSender.memberNumber,
          accountNumber: selectedSenderAccount.accountNumber,
          accountType: selectedSenderAccount.accountType,
          previousBalance: selectedSenderAccount.balance,
          newBalance: parseFloat(selectedSenderAccount.balance) - totalDeduction
        },
        receiver: {
          name: selectedReceiver.fullName,
          memberNumber: selectedReceiver.memberNumber,
          accountNumber: selectedReceiverAccount.accountNumber,
          accountType: selectedReceiverAccount.accountType,
          previousBalance: receiverAccounts.find(a => a.id === selectedReceiverAccount.id)?.balance || 0,
          newBalance: parseFloat(receiverAccounts.find(a => a.id === selectedReceiverAccount.id)?.balance || 0) + amount
        },
        timestamp: new Date(),
        teller: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'System'
      });

      setShowReceipt(true);
    } catch (error) {
      console.error('Transfer failed:', error);
      toast.error(error.response?.data?.message || 'Transfer failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAmountChange = (value) => {
    const amount = parseFloat(value) || 0;
    const fee = calculateTransferFee(amount);
    setTransferData({
      ...transferData,
      amount: value,
      transferFee: fee
    });
  };

  const handlePrintReceipt = () => {
    const printWindow = window.open('', '_blank');
    const receiptHtml = receiptRef.current?.innerHTML;

    if (printWindow && receiptHtml) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Transfer Receipt - ${transferResult?.reference}</title>
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
              .receipt-row {
                display: flex;
                justify-content: space-between;
                padding: 5px 0;
              }
              .receipt-label { font-weight: bold; }
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

  const handleNewTransfer = () => {
    setShowReceipt(false);
    setTransferResult(null);
    setSenderSearch('');
    setReceiverSearch('');
    setSenderMembers([]);
    setReceiverMembers([]);
    setSelectedSender(null);
    setSelectedReceiver(null);
    setSenderAccounts([]);
    setReceiverAccounts([]);
    setSelectedSenderAccount(null);
    setSelectedReceiverAccount(null);
    setTransferData({
      amount: '',
      description: '',
      transferFee: 0
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Fund Transfer"
        subtitle="Transfer funds between savings accounts"
      />

      {!showReceipt ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sender Selection */}
          <Card>
            <div className="p-4 border-b border-ink-200 dark:border-ink-700">
              <h3 className="font-semibold text-ink-900 dark:text-ink-100 flex items-center gap-2">
                <User size={18} />
                From (Sender)
              </h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={senderSearch}
                  onChange={(e) => setSenderSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchMember(senderSearch, 'sender')}
                  placeholder="Search sender..."
                  className="flex-1 px-3 py-2 border border-ink-300 dark:border-ink-600 rounded-lg bg-white dark:bg-ink-900 text-ink-900 dark:text-ink-100 text-sm focus:ring-2 focus:ring-teal-500"
                />
                <Button
                  size="sm"
                  onClick={() => handleSearchMember(senderSearch, 'sender')}
                  loading={searchingSender}
                  icon={Search}
                >
                  Search
                </Button>
              </div>

              {senderMembers.length > 0 && !selectedSender && (
                <div className="space-y-2">
                  {senderMembers.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => handleSelectMember(member, 'sender')}
                      className="w-full p-2 bg-ink-50 dark:bg-ink-900/50 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-900 text-left text-sm"
                    >
                      <div className="font-medium text-ink-900 dark:text-ink-100">{member.fullName}</div>
                      <div className="text-xs text-ink-500 dark:text-ink-400">{member.memberNumber}</div>
                    </button>
                  ))}
                </div>
              )}

              {selectedSender && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="text-sm font-medium text-green-900 dark:text-green-100">
                    {selectedSender.fullName}
                  </div>
                  <div className="text-xs text-green-700 dark:text-green-300">
                    {selectedSender.memberNumber}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedSender(null);
                      setSenderAccounts([]);
                      setSelectedSenderAccount(null);
                    }}
                    className="mt-2 text-xs text-green-700 dark:text-green-300 hover:underline"
                  >
                    Change
                  </button>
                </div>
              )}

              {senderAccounts.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-ink-600 dark:text-ink-400 uppercase">
                    Select Account
                  </div>
                  {senderAccounts.map((account) => (
                    <button
                      key={account.id}
                      onClick={() => setSelectedSenderAccount(account)}
                      className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                        selectedSenderAccount?.id === account.id
                          ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                          : 'border-ink-200 dark:border-ink-700 hover:border-teal-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-xs font-medium text-ink-900 dark:text-ink-100">
                            {account.accountType.replace(/_/g, ' ').toUpperCase()}
                          </div>
                          <div className="text-xs text-ink-500 dark:text-ink-400 font-mono">
                            {account.accountNumber}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-ink-900 dark:text-ink-100">
                            {formatKES(account.balance)}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Transfer Details */}
          <Card>
            <div className="p-4 border-b border-ink-200 dark:border-ink-700">
              <h3 className="font-semibold text-ink-900 dark:text-ink-100 flex items-center gap-2">
                <ArrowRightLeft size={18} />
                Transfer Details
              </h3>
            </div>
            <div className="p-4">
              {!selectedSenderAccount || !selectedReceiverAccount ? (
                <div className="text-center py-12 text-ink-500">
                  <AlertCircle className="mx-auto mb-3 text-ink-300" size={48} />
                  <p className="text-sm">Select sender and receiver accounts</p>
                </div>
              ) : (
                <form onSubmit={handleTransfer} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-ink-700 dark:text-ink-300 mb-2">
                      Transfer Amount <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={transferData.amount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required
                      className="w-full px-4 py-3 border border-ink-300 dark:border-ink-600 rounded-lg bg-white dark:bg-ink-900 text-ink-900 dark:text-ink-100 text-lg font-semibold focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  {transferData.amount && parseFloat(transferData.amount) > 0 && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-ink-600 dark:text-ink-400">Transfer Amount:</span>
                        <span className="font-semibold text-ink-900 dark:text-ink-100">
                          {formatKES(parseFloat(transferData.amount))}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink-600 dark:text-ink-400">Transfer Fee (0.1%):</span>
                        <span className="font-semibold text-ink-900 dark:text-ink-100">
                          {formatKES(transferData.transferFee)}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-blue-200 dark:border-blue-700">
                        <div className="flex justify-between">
                          <span className="font-semibold text-ink-700 dark:text-ink-300">
                            Total Deduction:
                          </span>
                          <span className="text-lg font-bold text-red-600 dark:text-red-400">
                            {formatKES(parseFloat(transferData.amount) + transferData.transferFee)}
                          </span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-blue-200 dark:border-blue-700">
                        <div className="flex justify-between">
                          <span className="font-semibold text-ink-700 dark:text-ink-300">
                            Receiver Gets:
                          </span>
                          <span className="text-lg font-bold text-green-600 dark:text-green-400">
                            {formatKES(parseFloat(transferData.amount))}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-ink-700 dark:text-ink-300 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={transferData.description}
                      onChange={(e) => setTransferData({ ...transferData, description: e.target.value })}
                      placeholder="Transfer purpose or notes..."
                      rows={3}
                      className="w-full px-4 py-2.5 border border-ink-300 dark:border-ink-600 rounded-lg bg-white dark:bg-ink-900 text-ink-900 dark:text-ink-100 focus:ring-2 focus:ring-teal-500 resize-none text-sm"
                    />
                  </div>

                  <Button
                    type="submit"
                    loading={submitting}
                    disabled={!transferData.amount || parseFloat(transferData.amount) <= 0}
                    icon={CheckCircle}
                    className="w-full"
                  >
                    Complete Transfer
                  </Button>
                </form>
              )}
            </div>
          </Card>

          {/* Receiver Selection */}
          <Card>
            <div className="p-4 border-b border-ink-200 dark:border-ink-700">
              <h3 className="font-semibold text-ink-900 dark:text-ink-100 flex items-center gap-2">
                <User size={18} />
                To (Receiver)
              </h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={receiverSearch}
                  onChange={(e) => setReceiverSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchMember(receiverSearch, 'receiver')}
                  placeholder="Search receiver..."
                  className="flex-1 px-3 py-2 border border-ink-300 dark:border-ink-600 rounded-lg bg-white dark:bg-ink-900 text-ink-900 dark:text-ink-100 text-sm focus:ring-2 focus:ring-teal-500"
                />
                <Button
                  size="sm"
                  onClick={() => handleSearchMember(receiverSearch, 'receiver')}
                  loading={searchingReceiver}
                  icon={Search}
                >
                  Search
                </Button>
              </div>

              {receiverMembers.length > 0 && !selectedReceiver && (
                <div className="space-y-2">
                  {receiverMembers.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => handleSelectMember(member, 'receiver')}
                      className="w-full p-2 bg-ink-50 dark:bg-ink-900/50 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-900 text-left text-sm"
                    >
                      <div className="font-medium text-ink-900 dark:text-ink-100">{member.fullName}</div>
                      <div className="text-xs text-ink-500 dark:text-ink-400">{member.memberNumber}</div>
                    </button>
                  ))}
                </div>
              )}

              {selectedReceiver && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="text-sm font-medium text-green-900 dark:text-green-100">
                    {selectedReceiver.fullName}
                  </div>
                  <div className="text-xs text-green-700 dark:text-green-300">
                    {selectedReceiver.memberNumber}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedReceiver(null);
                      setReceiverAccounts([]);
                      setSelectedReceiverAccount(null);
                    }}
                    className="mt-2 text-xs text-green-700 dark:text-green-300 hover:underline"
                  >
                    Change
                  </button>
                </div>
              )}

              {receiverAccounts.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-ink-600 dark:text-ink-400 uppercase">
                    Select Account
                  </div>
                  {receiverAccounts.map((account) => (
                    <button
                      key={account.id}
                      onClick={() => setSelectedReceiverAccount(account)}
                      className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                        selectedReceiverAccount?.id === account.id
                          ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                          : 'border-ink-200 dark:border-ink-700 hover:border-teal-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-xs font-medium text-ink-900 dark:text-ink-100">
                            {account.accountType.replace(/_/g, ' ').toUpperCase()}
                          </div>
                          <div className="text-xs text-ink-500 dark:text-ink-400 font-mono">
                            {account.accountNumber}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-ink-900 dark:text-ink-100">
                            {formatKES(account.balance)}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

      ) : (
        /* Receipt View */
        <Card className="max-w-3xl mx-auto">
          <div className="p-6 border-b border-ink-200 dark:border-ink-700 flex items-center justify-between">
            <h3 className="font-semibold text-ink-900 dark:text-ink-100">Transfer Receipt</h3>
            <div className="flex gap-2">
              <Button variant="outline" icon={Printer} onClick={handlePrintReceipt}>
                Print
              </Button>
              <Button onClick={handleNewTransfer}>
                New Transfer
              </Button>
            </div>
          </div>

          <div className="p-8">
            <div ref={receiptRef} className="max-w-md mx-auto">
              {/* Receipt Header */}
              <div className="text-center border-b-2 border-dashed border-ink-300 pb-4 mb-6">
                <div className="text-2xl font-bold text-ink-900 dark:text-ink-100 mb-2">
                  Imara SACCO
                </div>
                <div className="text-sm text-ink-600 dark:text-ink-400">
                  FUND TRANSFER RECEIPT
                </div>
              </div>

              {/* Transfer Icon */}
              <div className="text-center mb-6">
                <div className="inline-block p-4 bg-teal-100 dark:bg-teal-900/30 rounded-full">
                  <ArrowRightLeft className="text-teal-600 dark:text-teal-400" size={32} />
                </div>
              </div>

              {/* Transaction Details */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between py-2 border-b border-ink-200 dark:border-ink-700">
                  <span className="text-ink-600 dark:text-ink-400">Reference No:</span>
                  <span className="font-mono font-semibold text-ink-900 dark:text-ink-100">
                    {transferResult?.reference}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-ink-200 dark:border-ink-700">
                  <span className="text-ink-600 dark:text-ink-400">Date & Time:</span>
                  <span className="font-medium text-ink-900 dark:text-ink-100">
                    {formatDateTime(transferResult?.timestamp)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-ink-200 dark:border-ink-700">
                  <span className="text-ink-600 dark:text-ink-400">Teller:</span>
                  <span className="font-medium text-ink-900 dark:text-ink-100">
                    {transferResult?.teller}
                  </span>
                </div>
              </div>

              {/* Sender Details */}
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-xs font-semibold text-red-800 dark:text-red-300 uppercase mb-2">
                  From (Sender)
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-ink-600 dark:text-ink-400">Member:</span>
                    <span className="font-medium text-ink-900 dark:text-ink-100">
                      {transferResult?.sender?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-600 dark:text-ink-400">Account:</span>
                    <span className="font-mono text-ink-900 dark:text-ink-100">
                      {transferResult?.sender?.accountNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-600 dark:text-ink-400">Previous Balance:</span>
                    <span className="font-medium text-ink-900 dark:text-ink-100">
                      {formatKES(transferResult?.sender?.previousBalance)}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-ink-700 dark:text-ink-300">New Balance:</span>
                    <span className="text-red-600 dark:text-red-400">
                      {formatKES(transferResult?.sender?.newBalance)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Receiver Details */}
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-xs font-semibold text-green-800 dark:text-green-300 uppercase mb-2">
                  To (Receiver)
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-ink-600 dark:text-ink-400">Member:</span>
                    <span className="font-medium text-ink-900 dark:text-ink-100">
                      {transferResult?.receiver?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-600 dark:text-ink-400">Account:</span>
                    <span className="font-mono text-ink-900 dark:text-ink-100">
                      {transferResult?.receiver?.accountNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-600 dark:text-ink-400">Previous Balance:</span>
                    <span className="font-medium text-ink-900 dark:text-ink-100">
                      {formatKES(transferResult?.receiver?.previousBalance)}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-ink-700 dark:text-ink-300">New Balance:</span>
                    <span className="text-green-600 dark:text-green-400">
                      {formatKES(transferResult?.receiver?.newBalance)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Amount Summary */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800 mb-6">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-ink-600 dark:text-ink-400">Transfer Amount:</span>
                    <span className="font-bold text-ink-900 dark:text-ink-100">
                      {formatKES(transferResult?.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-600 dark:text-ink-400">Transfer Fee:</span>
                    <span className="font-medium text-ink-900 dark:text-ink-100">
                      {formatKES(transferResult?.fee)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-blue-300 dark:border-blue-700">
                    <div className="flex justify-between">
                      <span className="font-semibold text-ink-700 dark:text-ink-300">
                        Total Deducted:
                      </span>
                      <span className="text-lg font-bold text-red-600 dark:text-red-400">
                        {formatKES(transferResult?.totalDeducted)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center pt-6 border-t-2 border-dashed border-ink-300">
                <div className="text-sm text-ink-600 dark:text-ink-400 mb-2">
                  Transfer completed successfully!
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

export default FundTransfer;
