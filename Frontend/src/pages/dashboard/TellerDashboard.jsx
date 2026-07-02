import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  Wallet, TrendingUp, TrendingDown, Clock, Users, 
  Smartphone, DollarSign, RefreshCcw, FileText, Target,
  BarChart3, Download, ArrowRightLeft, Search, Printer, 
  List, HandCoins, PlusCircle
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/cards/StatCard';
import { SkeletonCard } from '../../components/loaders/Skeleton';
import DataTable from '../../components/tables/DataTable';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { useAuth } from '../../hooks/useAuth';
import { formatKES, formatNumber, formatDate, formatTime } from '../../utils/format';
import CashCountingModal from './CashCountingModal';
import TargetsCard from './TargetsCard';
import TransactionReviewModal from './TransactionReviewModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const TellerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [targets, setTargets] = useState(null);
  const [showCashCounting, setShowCashCounting] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async (showToast = false) => {
    if (showToast) setRefreshing(true);
    else setLoading(true);
    
    try {
      const token = localStorage.getItem('accessToken');
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, txRes, targetsRes] = await Promise.all([
        axios.get(`${API_URL}/dashboard/teller/stats`, { headers }).catch(err => {
          console.error('Teller stats error:', err.response?.data || err.message);
          return { data: { data: null } };
        }),
        axios.get(`${API_URL}/dashboard/teller/transactions?limit=10`, { headers }).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_URL}/teller/daily-targets`, { headers }).catch(() => ({ data: { data: null } })),
      ]);

      setStats(statsRes.data.data);
      setTransactions(txRes.data.data || []);
      setTargets(targetsRes.data.data);
      
      if (!statsRes.data.data) {
        toast.error('Failed to load statistics. Please check your connection.');
      }
      
      if (showToast) {
        toast.success('Dashboard refreshed');
      }
    } catch (error) {
      console.error('Failed to fetch teller dashboard:', error);
      toast.error('Failed to load dashboard data. Please refresh the page.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  const handleDownloadEODReport = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_URL}/teller/end-of-day-report/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `eod-report-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('End of Day Report downloaded');
    } catch (error) {
      console.error('Failed to download report:', error);
      toast.error('Failed to download report');
    }
  };

  const handleReviewTransaction = (tx) => {
    setSelectedTransaction(tx);
    setShowReview(true);
  };

  const handleReviewComplete = () => {
    setShowReview(false);
    setSelectedTransaction(null);
    fetchDashboardData(true);
  };

  const txColumns = [
    { 
      key: 'reference', 
      label: 'Reference',
      render: (r) => <span className="font-mono text-xs">{r.reference}</span>
    },
    { 
      key: 'member', 
      label: 'Member',
      render: (r) => r.member ? (
        <div>
          <div className="font-medium">{r.member.name}</div>
          <div className="text-xs text-ink-400">{r.member.memberNumber}</div>
        </div>
      ) : 'N/A'
    },
    { 
      key: 'type', 
      label: 'Type',
      render: (r) => (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${
          r.type === 'deposit' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
          'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
        }`}>
          {r.type}
        </span>
      )
    },
    { 
      key: 'amount', 
      label: 'Amount', 
      render: (r) => (
        <span className={r.type === 'deposit' ? 'text-green-600 font-semibold' : 'text-orange-600 font-semibold'}>
          {r.type === 'deposit' ? '+' : '-'}{formatKES(r.amount)}
        </span>
      )
    },
    { 
      key: 'paymentMethod', 
      label: 'Method',
      render: (r) => r.paymentMethod || 'Cash'
    },
    { 
      key: 'date', 
      label: 'Time', 
      render: (r) => formatTime(r.date)
    },
    { 
      key: 'status', 
      label: 'Status', 
      render: (r) => (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${
          r.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
          r.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}>
          {r.status}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => r.status === 'pending' ? (
        <button
          onClick={() => handleReviewTransaction(r)}
          className="text-teal-600 hover:text-teal-700 text-sm font-medium"
        >
          Review
        </button>
      ) : null
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <PageHeader
          title={`Teller Dashboard - ${user?.firstName || 'Welcome'}`}
          subtitle={`Today's transactions as of ${formatTime(new Date())}`}
        />
        <div className="flex gap-2">
          <Button
            onClick={handleDownloadEODReport}
            variant="outline"
            icon={Download}
          >
            EOD Report
          </Button>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            icon={RefreshCcw}
            className={refreshing ? 'animate-spin' : ''}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Daily Targets Card */}
      {targets && <TargetsCard targets={targets} />}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
        ) : stats ? (
          <>
            <StatCard
              title="Deposits Today"
              value={formatKES(stats.totalDepositsToday)}
              subtitle={`${stats.depositCount} transactions`}
              icon={TrendingUp}
              trend="up"
              trendValue={`${stats.depositCount}`}
              color="green"
            />
            <StatCard
              title="Withdrawals Today"
              value={formatKES(stats.totalWithdrawalsToday)}
              subtitle={`${stats.withdrawalCount} transactions`}
              icon={TrendingDown}
              trend="down"
              trendValue={`${stats.withdrawalCount}`}
              color="orange"
            />
            <StatCard
              title="Total Transactions"
              value={formatNumber(stats.totalTransactionsToday)}
              subtitle="Completed today"
              icon={RefreshCcw}
              color="blue"
            />
            <StatCard
              title="Cash in Hand"
              value={formatKES(stats.cashInHand)}
              subtitle="Net today"
              icon={Wallet}
              trend={stats.cashInHand >= 0 ? 'up' : 'down'}
              color={stats.cashInHand >= 0 ? 'teal' : 'red'}
            />
            <StatCard
              title="Pending Transactions"
              value={formatNumber(stats.pendingTransactions)}
              subtitle="Awaiting approval"
              icon={Clock}
              color="yellow"
            />
            <StatCard
              title="Members Served"
              value={formatNumber(stats.activeMembersServed)}
              subtitle="Unique today"
              icon={Users}
              color="purple"
            />
            <StatCard
              title="M-Pesa Collections"
              value={formatKES(stats.mpesaCollections)}
              subtitle={`${stats.mpesaCount} transactions`}
              icon={Smartphone}
              color="green"
            />
            <StatCard
              title="End of Day Balance"
              value={formatKES(stats.endOfDayBalance)}
              subtitle={`Opening: ${formatKES(stats.openingBalance)}`}
              icon={DollarSign}
              trend={stats.endOfDayBalance >= stats.openingBalance ? 'up' : 'down'}
              color="teal"
            />
          </>
        ) : (
          <div className="col-span-full text-center py-8 text-ink-500">
            Failed to load statistics
          </div>
        )}
      </div>

      {/* Today's Transactions Table */}
      <Card className="mb-6">
        <div className="p-4 sm:p-6 border-b border-ink-200 dark:border-ink-700">
          <h2 className="text-lg font-semibold text-ink-800 dark:text-ink-100">
            Today's Transactions
          </h2>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">
            Most recent transactions processed today
          </p>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-center text-ink-500">Loading transactions...</div>
          ) : transactions.length > 0 ? (
            <DataTable
              columns={txColumns}
              data={transactions}
            />
          ) : (
            <div className="p-6 text-center text-ink-500">
              No transactions today
            </div>
          )}
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-ink-800 dark:text-ink-100 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-3">
          <button
            onClick={() => navigate('/savings/deposit')}
            className="flex flex-col items-center justify-center p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-all hover:scale-105 active:scale-95"
          >
            <TrendingUp className="text-green-600 mb-2" size={24} />
            <span className="text-xs font-semibold text-green-900 dark:text-green-100 text-center">New Deposit</span>
          </button>

          <button
            onClick={() => navigate('/savings/withdrawal')}
            className="flex flex-col items-center justify-center p-4 bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-all hover:scale-105 active:scale-95"
          >
            <TrendingDown className="text-orange-600 mb-2" size={24} />
            <span className="text-xs font-semibold text-orange-900 dark:text-orange-100 text-center">New Withdrawal</span>
          </button>

          <button
            onClick={() => navigate('/savings/transfer')}
            className="flex flex-col items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all hover:scale-105 active:scale-95"
          >
            <ArrowRightLeft className="text-blue-600 mb-2" size={24} />
            <span className="text-xs font-semibold text-blue-900 dark:text-blue-100 text-center">Transfer Funds</span>
          </button>

          <button
            onClick={() => navigate('/members')}
            className="flex flex-col items-center justify-center p-4 bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all hover:scale-105 active:scale-95"
          >
            <Search className="text-purple-600 mb-2" size={24} />
            <span className="text-xs font-semibold text-purple-900 dark:text-purple-100 text-center">Search Member</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900/20 border-2 border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900/30 transition-all hover:scale-105 active:scale-95"
          >
            <Printer className="text-gray-600 mb-2" size={24} />
            <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 text-center">Print Receipt</span>
          </button>

          <button
            onClick={() => navigate('/transactions')}
            className="flex flex-col items-center justify-center p-4 bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-all hover:scale-105 active:scale-95"
          >
            <List className="text-indigo-600 mb-2" size={24} />
            <span className="text-xs font-semibold text-indigo-900 dark:text-indigo-100 text-center">View Transactions</span>
          </button>

          <button
            onClick={() => navigate('/loans/repayment')}
            className="flex flex-col items-center justify-center p-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-all hover:scale-105 active:scale-95"
          >
            <HandCoins className="text-yellow-600 mb-2" size={24} />
            <span className="text-xs font-semibold text-yellow-900 dark:text-yellow-100 text-center">Loan Repayment</span>
          </button>

          <button
            onClick={() => navigate('/savings/open-account')}
            className="flex flex-col items-center justify-center p-4 bg-teal-50 dark:bg-teal-900/20 border-2 border-teal-200 dark:border-teal-800 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-all hover:scale-105 active:scale-95"
          >
            <PlusCircle className="text-teal-600 mb-2" size={24} />
            <span className="text-xs font-semibold text-teal-900 dark:text-teal-100 text-center">Open Account</span>
          </button>
        </div>
      </div>

      {/* Additional Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          onClick={() => setShowCashCounting(true)}
          className="p-4 bg-white dark:bg-ink-800 border-2 border-ink-200 dark:border-ink-700 rounded-lg hover:shadow-md transition-all flex items-center gap-3"
        >
          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <Wallet className="text-purple-600" size={24} />
          </div>
          <div className="flex-1 text-left">
            <div className="font-semibold text-ink-900 dark:text-ink-100">Cash Counting</div>
            <div className="text-xs text-ink-500 dark:text-ink-400">Reconcile today's cash</div>
          </div>
        </button>

        <button
          onClick={handleDownloadEODReport}
          className="p-4 bg-white dark:bg-ink-800 border-2 border-ink-200 dark:border-ink-700 rounded-lg hover:shadow-md transition-all flex items-center gap-3"
        >
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Download className="text-blue-600" size={24} />
          </div>
          <div className="flex-1 text-left">
            <div className="font-semibold text-ink-900 dark:text-ink-100">Download EOD Report</div>
            <div className="text-xs text-ink-500 dark:text-ink-400">End of day summary</div>
          </div>
        </button>

        <button
          onClick={() => navigate('/teller/performance')}
          className="p-4 bg-white dark:bg-ink-800 border-2 border-ink-200 dark:border-ink-700 rounded-lg hover:shadow-md transition-all flex items-center gap-3"
        >
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <BarChart3 className="text-green-600" size={24} />
          </div>
          <div className="flex-1 text-left">
            <div className="font-semibold text-ink-900 dark:text-ink-100">View Performance</div>
            <div className="text-xs text-ink-500 dark:text-ink-400">Analytics & metrics</div>
          </div>
        </button>
      </div>

      {/* Modals */}
      {showCashCounting && (
        <CashCountingModal
          onClose={() => setShowCashCounting(false)}
          onSubmit={() => {
            setShowCashCounting(false);
            toast.success('Cash counting submitted');
          }}
          expectedCash={stats?.cashInHand || 0}
        />
      )}

      {showReview && selectedTransaction && (
        <TransactionReviewModal
          transaction={selectedTransaction}
          onClose={() => setShowReview(false)}
          onComplete={handleReviewComplete}
        />
      )}
    </div>
  );
};

export default TellerDashboard;
