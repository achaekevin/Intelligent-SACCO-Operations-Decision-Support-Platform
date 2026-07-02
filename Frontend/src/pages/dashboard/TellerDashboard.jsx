import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  Wallet, TrendingUp, TrendingDown, Clock, Users, 
  Smartphone, DollarSign, RefreshCcw, FileText, Target,
  BarChart3, Download
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <button
          onClick={() => navigate('/savings/deposit')}
          className="p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
        >
          <TrendingUp className="text-green-600 mb-2" size={24} />
          <div className="font-semibold text-green-900 dark:text-green-100">New Deposit</div>
        </button>
        <button
          onClick={() => navigate('/savings/withdrawal')}
          className="p-4 bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
        >
          <TrendingDown className="text-orange-600 mb-2" size={24} />
          <div className="font-semibold text-orange-900 dark:text-orange-100">New Withdrawal</div>
        </button>
        <button
          onClick={() => setShowCashCounting(true)}
          className="p-4 bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
        >
          <Wallet className="text-purple-600 mb-2" size={24} />
          <div className="font-semibold text-purple-900 dark:text-purple-100">Cash Counting</div>
        </button>
        <button
          onClick={() => navigate('/teller/performance')}
          className="p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
        >
          <BarChart3 className="text-blue-600 mb-2" size={24} />
          <div className="font-semibold text-blue-900 dark:text-blue-100">Performance</div>
        </button>
        <button
          onClick={handleRefresh}
          className="p-4 bg-teal-50 dark:bg-teal-900/20 border-2 border-teal-200 dark:border-teal-800 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors"
        >
          <RefreshCcw className="text-teal-600 mb-2" size={24} />
          <div className="font-semibold text-teal-900 dark:text-teal-100">Refresh Data</div>
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
