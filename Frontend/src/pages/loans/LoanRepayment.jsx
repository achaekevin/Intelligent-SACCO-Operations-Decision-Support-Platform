import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  Search, DollarSign, AlertCircle, CheckCircle, User,
  CreditCard, Calendar, TrendingDown, Printer, FileText
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { formatKES, formatDate, formatDateTime } from '../../utils/format';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const LoanRepayment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const receiptRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [loans, setLoans] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [loanSummary, setLoanSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const [repaymentData, setRepaymentData] = useState({
    amount: '',
    paymentMethod: 'cash',
    externalReference: '',
    repaymentType: 'regular'
  });
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'mpesa', label: 'M-Pesa' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'cheque', label: 'Cheque' },
  ];

  const repaymentTypes = [
    { value: 'regular', label: 'Regular Repayment', desc: 'Normal installment payment' },
    { value: 'partial', label: 'Partial Payment', desc: 'Pay any amount' },
    { value: 'full', label: 'Full Settlement', desc: 'Pay off entire loan' },
    { value: 'penalty', label: 'Penalty Only', desc: 'Pay penalties/late fees' },
  ];

  const handleSearchMember = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.error('Please enter a search term');
      return;
    }

    setSearching(true);
    setSelectedMember(null);
    setSelectedLoan(null);
    setLoans([]);
    setLoanSummary(null);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_URL}/members/search`, {
        params: { q: searchQuery.trim() },
        headers: { Authorization: `Bearer ${token}` }
      });

      const results = response.data.data || [];
      setMembers(results);

      if (results.length === 0) {
        toast.error('No members found');
      } else if (results.length === 1) {
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
    setSelectedLoan(null);
    setLoanSummary(null);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_URL}/loans`, {
        params: { memberId: member.id, status: 'disbursed' },
        headers: { Authorization: `Bearer ${token}` }
      });

      const disbursedLoans = response.data.data || [];
      setLoans(disbursedLoans);

      if (disbursedLoans.length === 0) {
        toast.error('No active loans found for this member');
      }
    } catch (error) {
      console.error('Failed to load loans:', error);
      toast.error('Failed to load member loans');
      setLoans([]);
    }
  };

  const handleSelectLoan = async (loan) => {
    setSelectedLoan(loan);
    setLoadingSummary(true);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_URL}/loans/${loan.id}/summary`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setLoanSummary(response.data.data);
    } catch (error) {
      console.error('Failed to load loan summary:', error);
      toast.error('Failed to load loan details');
      setLoanSummary(null);
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleRepayment = async (e) => {
    e.preventDefault();

    if (!selectedLoan) {
      toast.error('Please select a loan');
      return;
    }

    if (!repaymentData.amount || parseFloat(repaymentData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (repaymentData.paymentMethod === 'mpesa' && !repaymentData.externalReference) {
      toast.error('Please enter M-Pesa transaction code');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        `${API_URL}/loans/${selectedLoan.id}/repay`,
        {
          amount: parseFloat(repaymentData.amount),
          paymentMethod: repaymentData.paymentMethod,
          externalReference: repaymentData.externalReference || null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Repayment processed successfully!');

      // Reload loan summary
      await handleSelectLoan(selectedLoan);

      // Clear form
      setRepaymentData({
        amount: '',
        paymentMethod: 'cash',
        externalReference: '',
        repaymentType: 'regular'
      });

      // Note: Receipt loading would require getting the latest repayment ID
      // For now, we'll skip automatic receipt display
    } catch (error) {
      console.error('Repayment failed:', error);
      toast.error(error.response?.data?.message || 'Repayment failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleNewRepayment = () => {
    setShowReceipt(false);
    setReceipt(null);
    setSearchQuery('');
    setMembers([]);
    setSelectedMember(null);
    setSelectedLoan(null);
    setLoans([]);
    setLoanSummary(null);
    setRepaymentData({
      amount: '',
      paymentMethod: 'cash',
      externalReference: '',
      repaymentType: 'regular'
    });
  };

  // Calculate recommended amount based on repayment type
  const getRecommendedAmount = () => {
    if (!loanSummary) return 0;

    switch (repaymentData.repaymentType) {
      case 'regular':
        return loanSummary.nextPayment?.remaining || 0;
      case 'full':
        return loanSummary.loan.totalOutstanding;
      case 'penalty':
        return loanSummary.loan.penaltiesBalance;
      default:
        return 0;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Loan Repayment"
        subtitle="Process loan repayments and settlements"
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
                      setSelectedLoan(null);
                      setLoans([]);
                      setLoanSummary(null);
                    }}
                    className="mt-2 text-xs text-green-700 dark:text-green-300 hover:underline"
                  >
                    Change member
                  </button>
                </div>
              )}

              {/* Loan Selection */}
              {loans.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-ink-900 dark:text-ink-100 mb-3 flex items-center gap-2">
                    <CreditCard size={18} />
                    2. Select Loan
                  </h4>
                  <div className="space-y-2">
                    {loans.map((loan) => (
                      <button
                        key={loan.id}
                        onClick={() => handleSelectLoan(loan)}
                        className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                          selectedLoan?.id === loan.id
                            ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                            : 'border-ink-200 dark:border-ink-700 hover:border-teal-300 dark:hover:border-teal-700'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium text-ink-900 dark:text-ink-100">
                              {loan.type || 'Personal Loan'}
                            </div>
                            <div className="text-xs text-ink-500 dark:text-ink-400 font-mono">
                              {loan.loanNumber}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-orange-600 dark:text-orange-400">
                              {formatKES(loan.principalBalance)}
                            </div>
                            <div className="text-xs text-ink-500 dark:text-ink-400">
                              Outstanding
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

          {/* Repayment Form & Details */}
          <div className="space-y-6">
            {/* Loan Summary */}
            {loanSummary && (
              <Card>
                <div className="p-4 sm:p-6 border-b border-ink-200 dark:border-ink-700">
                  <h3 className="font-semibold text-ink-900 dark:text-ink-100">Loan Details</h3>
                </div>
                <div className="p-4 sm:p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-ink-500 dark:text-ink-400">Outstanding Balance</div>
                      <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
                        {formatKES(loanSummary.loan.totalOutstanding)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-ink-500 dark:text-ink-400">Monthly Installment</div>
                      <div className="text-xl font-bold text-ink-900 dark:text-ink-100">
                        {formatKES(loanSummary.loan.monthlyInstallment)}
                      </div>
                    </div>
                  </div>

                  {loanSummary.nextPayment && (
                    <div className={`p-4 rounded-lg ${
                      loanSummary.nextPayment.isOverdue
                        ? 'bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800'
                        : 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-ink-900 dark:text-ink-100">
                          Next Payment
                        </span>
                        {loanSummary.nextPayment.isOverdue && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 rounded text-xs font-semibold">
                            OVERDUE
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-ink-600 dark:text-ink-400">Due Date:</span>
                          <span className="font-medium text-ink-900 dark:text-ink-100">
                            {formatDate(loanSummary.nextPayment.dueDate)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-ink-600 dark:text-ink-400">Amount Due:</span>
                          <span className="font-bold text-ink-900 dark:text-ink-100">
                            {formatKES(loanSummary.nextPayment.remaining)}
                          </span>
                        </div>
                        {loanSummary.nextPayment.penaltyDue > 0 && (
                          <div className="flex justify-between text-red-600 dark:text-red-400">
                            <span>Penalties:</span>
                            <span className="font-bold">{formatKES(loanSummary.nextPayment.penaltyDue)}</span>
                          </div>
                        )}
                        {loanSummary.nextPayment.isOverdue && (
                          <div className="flex justify-between text-red-600 dark:text-red-400">
                            <span>Days Overdue:</span>
                            <span className="font-bold">{loanSummary.nextPayment.daysOverdue}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Repayment Form */}
            <Card>
              <div className="p-4 sm:p-6 border-b border-ink-200 dark:border-ink-700">
                <h3 className="font-semibold text-ink-900 dark:text-ink-100 flex items-center gap-2">
                  <DollarSign size={20} />
                  3. Process Repayment
                </h3>
              </div>
              <div className="p-4 sm:p-6">
                {!loanSummary ? (
                  <div className="text-center py-12 text-ink-500">
                    <AlertCircle className="mx-auto mb-3 text-ink-300" size={48} />
                    <p>Select a member and loan to continue</p>
                  </div>
                ) : (
                  <form onSubmit={handleRepayment} className="space-y-6">
                    {/* Repayment Type */}
                    <div>
                      <label className="block text-sm font-semibold text-ink-700 dark:text-ink-300 mb-2">
                        Repayment Type
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {repaymentTypes.map((type) => (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => {
                              setRepaymentData({ ...repaymentData, repaymentType: type.value });
                              const recommended = getRecommendedAmount();
                              if (recommended > 0) {
                                setRepaymentData(prev => ({ ...prev, amount: recommended.toString() }));
                              }
                            }}
                            className={`p-3 rounded-lg border-2 transition-all text-left ${
                              repaymentData.repaymentType === type.value
                                ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                                : 'border-ink-200 dark:border-ink-700 hover:border-teal-300'
                            }`}
                          >
                            <div className="font-medium text-sm text-ink-900 dark:text-ink-100">
                              {type.label}
                            </div>
                            <div className="text-xs text-ink-500 dark:text-ink-400 mt-1">
                              {type.desc}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Amount */}
                    <div>
                      <label className="block text-sm font-semibold text-ink-700 dark:text-ink-300 mb-2">
                        Repayment Amount <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={repaymentData.amount}
                        onChange={(e) => setRepaymentData({ ...repaymentData, amount: e.target.value })}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        required
                        className="w-full px-4 py-3 border border-ink-300 dark:border-ink-600 rounded-lg bg-white dark:bg-ink-900 text-ink-900 dark:text-ink-100 text-lg font-semibold focus:ring-2 focus:ring-teal-500"
                      />
                      {getRecommendedAmount() > 0 && (
                        <button
                          type="button"
                          onClick={() => setRepaymentData({ ...repaymentData, amount: getRecommendedAmount().toString() })}
                          className="mt-2 text-xs text-teal-600 dark:text-teal-400 hover:underline"
                        >
                          Use recommended: {formatKES(getRecommendedAmount())}
                        </button>
                      )}
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
                            onClick={() => setRepaymentData({ ...repaymentData, paymentMethod: method.value })}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              repaymentData.paymentMethod === method.value
                                ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                                : 'border-ink-200 dark:border-ink-700 hover:border-teal-300'
                            }`}
                          >
                            <span className="text-sm font-medium">{method.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* External Reference */}
                    {(repaymentData.paymentMethod === 'mpesa' || repaymentData.paymentMethod === 'bank_transfer' || repaymentData.paymentMethod === 'cheque') && (
                      <div>
                        <label className="block text-sm font-semibold text-ink-700 dark:text-ink-300 mb-2">
                          {repaymentData.paymentMethod === 'mpesa' && 'M-Pesa Transaction Code'}
                          {repaymentData.paymentMethod === 'bank_transfer' && 'Bank Reference'}
                          {repaymentData.paymentMethod === 'cheque' && 'Cheque Number'}
                          {repaymentData.paymentMethod === 'mpesa' && <span className="text-red-500"> *</span>}
                        </label>
                        <input
                          type="text"
                          value={repaymentData.externalReference}
                          onChange={(e) => setRepaymentData({ ...repaymentData, externalReference: e.target.value })}
                          placeholder={repaymentData.paymentMethod === 'mpesa' ? 'SH12AB3C4D' : 'Enter reference'}
                          required={repaymentData.paymentMethod === 'mpesa'}
                          className="w-full px-4 py-2.5 border border-ink-300 dark:border-ink-600 rounded-lg bg-white dark:bg-ink-900 text-ink-900 dark:text-ink-100 focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                    )}

                    <Button
                      type="submit"
                      loading={submitting}
                      disabled={!repaymentData.amount || parseFloat(repaymentData.amount) <= 0}
                      icon={CheckCircle}
                      className="w-full"
                    >
                      Process Repayment
                    </Button>
                  </form>
                )}
              </div>
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default LoanRepayment;
