import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  BarChart3, TrendingUp, Users, DollarSign, 
  Clock, CheckCircle, XCircle, Calendar, ArrowLeft
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { SkeletonCard } from '../../components/loaders/Skeleton';
import { formatKES, formatNumber, formatDate } from '../../utils/format';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const Performance = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    fetchPerformanceMetrics();
  }, [dateRange]);

  const fetchPerformanceMetrics = async () => {
    setLoading(true);
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        `${API_URL}/teller/performance`,
        {
          params: dateRange,
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setMetrics(response.data.data);
    } catch (error) {
      console.error('Failed to fetch performance metrics:', error);
      toast.error('Failed to load performance data');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (field, value) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <PageHeader title="Teller Performance" subtitle="Loading..." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <PageHeader title="Teller Performance" subtitle="No data available" />
        <Card className="mt-6">
          <div className="p-8 text-center text-ink-500">
            Failed to load performance data. Please try again.
          </div>
        </Card>
      </div>
    );
  }

  const { period, summary, dailyMetrics } = metrics;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            icon={ArrowLeft}
            onClick={() => navigate('/dashboard')}
          >
            Back
          </Button>
          <PageHeader
            title="Teller Performance Analytics"
            subtitle={`${period.days} days of performance data`}
          />
        </div>
      </div>

      {/* Date Range Filter */}
      <Card className="mb-6">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="text-ink-500" size={20} />
              <span className="text-sm font-semibold text-ink-700 dark:text-ink-300">
                Date Range:
              </span>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1">
              <div className="flex items-center gap-2">
                <label className="text-sm text-ink-600 dark:text-ink-400">From:</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => handleDateChange('startDate', e.target.value)}
                  className="px-3 py-1.5 border border-ink-300 dark:border-ink-600 rounded-lg bg-white dark:bg-ink-900 text-ink-900 dark:text-ink-100 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-ink-600 dark:text-ink-400">To:</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => handleDateChange('endDate', e.target.value)}
                  className="px-3 py-1.5 border border-ink-300 dark:border-ink-600 rounded-lg bg-white dark:bg-ink-900 text-ink-900 dark:text-ink-100 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <BarChart3 className="text-blue-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-ink-900 dark:text-ink-100">
                {formatNumber(summary.totalTransactions)}
              </div>
              <div className="text-xs text-ink-500 dark:text-ink-400">
                Total Transactions
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <Users className="text-purple-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-ink-900 dark:text-ink-100">
                {formatNumber(summary.totalUniqueMembers)}
              </div>
              <div className="text-xs text-ink-500 dark:text-ink-400">
                Unique Members
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <TrendingUp className="text-green-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatKES(summary.totalDeposits)}
              </div>
              <div className="text-xs text-ink-500 dark:text-ink-400">
                Total Deposits
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
              <DollarSign className="text-orange-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {formatKES(summary.totalWithdrawals)}
              </div>
              <div className="text-xs text-ink-500 dark:text-ink-400">
                Total Withdrawals
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-50 dark:bg-teal-900/20 rounded-xl">
              <CheckCircle className="text-teal-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                {summary.successRate}%
              </div>
              <div className="text-xs text-ink-500 dark:text-ink-400">
                Success Rate
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
              <Clock className="text-yellow-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-ink-900 dark:text-ink-100">
                {summary.avgProcessingTime.toFixed(1)} min
              </div>
              <div className="text-xs text-ink-500 dark:text-ink-400">
                Avg Processing Time
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Performance Breakdown */}
      <Card className="mb-6">
        <div className="p-4 sm:p-6 border-b border-ink-200 dark:border-ink-700">
          <h2 className="text-lg font-semibold text-ink-800 dark:text-ink-100">
            Performance Breakdown
          </h2>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">
            Overall statistics for the selected period
          </p>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Transaction Stats */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-300 flex items-center gap-2">
                <BarChart3 size={16} />
                Transaction Statistics
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-ink-50 dark:bg-ink-900/50 rounded-lg">
                  <span className="text-sm text-ink-600 dark:text-ink-400">Total Transactions</span>
                  <span className="font-semibold text-ink-900 dark:text-ink-100">
                    {formatNumber(summary.totalTransactions)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <span className="text-sm text-ink-600 dark:text-ink-400">Total Deposits</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {formatKES(summary.totalDeposits)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <span className="text-sm text-ink-600 dark:text-ink-400">Total Withdrawals</span>
                  <span className="font-semibold text-orange-600 dark:text-orange-400">
                    {formatKES(summary.totalWithdrawals)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                  <span className="text-sm text-ink-600 dark:text-ink-400">Net Cash Flow</span>
                  <span className="font-semibold text-teal-600 dark:text-teal-400">
                    {formatKES(summary.totalDeposits - summary.totalWithdrawals)}
                  </span>
                </div>
              </div>
            </div>

            {/* Quality Metrics */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-300 flex items-center gap-2">
                <CheckCircle size={16} />
                Quality Metrics
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-ink-50 dark:bg-ink-900/50 rounded-lg">
                  <span className="text-sm text-ink-600 dark:text-ink-400">Success Rate</span>
                  <span className="font-semibold text-teal-600 dark:text-teal-400">
                    {summary.successRate}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <span className="text-sm text-ink-600 dark:text-ink-400">Rejected Transactions</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    {formatNumber(summary.rejectedCount)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <span className="text-sm text-ink-600 dark:text-ink-400">Avg Processing Time</span>
                  <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                    {summary.avgProcessingTime.toFixed(1)} minutes
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <span className="text-sm text-ink-600 dark:text-ink-400">Unique Members Served</span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400">
                    {formatNumber(summary.totalUniqueMembers)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Daily Metrics Table */}
      <Card>
        <div className="p-4 sm:p-6 border-b border-ink-200 dark:border-ink-700">
          <h2 className="text-lg font-semibold text-ink-800 dark:text-ink-100">
            Daily Performance
          </h2>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">
            Day-by-day breakdown of transactions and performance
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-ink-50 dark:bg-ink-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-ink-600 dark:text-ink-400 uppercase">
                  Date
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-ink-600 dark:text-ink-400 uppercase">
                  Transactions
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-ink-600 dark:text-ink-400 uppercase">
                  Members
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-ink-600 dark:text-ink-400 uppercase">
                  Deposits
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-ink-600 dark:text-ink-400 uppercase">
                  Withdrawals
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-ink-600 dark:text-ink-400 uppercase">
                  Avg Time (min)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-200 dark:divide-ink-700">
              {dailyMetrics.length > 0 ? (
                dailyMetrics.map((day, index) => (
                  <tr
                    key={index}
                    className="hover:bg-ink-50 dark:hover:bg-ink-900/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-ink-900 dark:text-ink-100">
                      {formatDate(day.date)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-ink-900 dark:text-ink-100">
                      {formatNumber(day.transactions)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-ink-900 dark:text-ink-100">
                      {formatNumber(day.uniqueMembers)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-green-600 dark:text-green-400 font-semibold">
                      {formatKES(day.deposits)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-orange-600 dark:text-orange-400 font-semibold">
                      {formatKES(day.withdrawals)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-ink-600 dark:text-ink-400">
                      {day.avgProcessingTime.toFixed(1)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-ink-500">
                    No data available for the selected period
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Performance;
