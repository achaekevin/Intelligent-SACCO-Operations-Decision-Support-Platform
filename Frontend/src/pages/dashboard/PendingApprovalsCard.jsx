import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  Clock, AlertCircle, CheckCircle, XCircle, TrendingDown,
  RefreshCcw, Filter, ChevronRight, DollarSign, User, Calendar
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { formatKES, formatDateTime, formatDate } from '../../utils/format';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const PendingApprovalsCard = () => {
  const [loading, setLoading] = useState(true);
  const [approvals, setApprovals] = useState([]);
  const [filter, setFilter] = useState('all'); // all, large_withdrawal, reversal, exceptional
  const [statusFilter, setStatusFilter] = useState('pending'); // pending, approved, rejected, all

  useEffect(() => {
    fetchPendingApprovals();
  }, [filter, statusFilter]);

  const fetchPendingApprovals = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const params = {};
      if (filter !== 'all') params.type = filter;
      if (statusFilter !== 'all') params.status = statusFilter;

      const response = await axios.get(`${API_URL}/teller/pending-approvals`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      setApprovals(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch pending approvals:', error);
      if (error.response?.status !== 404) {
        toast.error('Failed to load pending approvals');
      }
      setApprovals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Are you sure you want to approve this transaction?')) return;

    try {
      const token = localStorage.getItem('accessToken');
      await axios.patch(
        `${API_URL}/teller/pending-approvals/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Transaction approved successfully');
      fetchPendingApprovals();
    } catch (error) {
      console.error('Failed to approve:', error);
      toast.error(error.response?.data?.message || 'Failed to approve transaction');
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      const token = localStorage.getItem('accessToken');
      await axios.patch(
        `${API_URL}/teller/pending-approvals/${id}/reject`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Transaction rejected');
      fetchPendingApprovals();
    } catch (error) {
      console.error('Failed to reject:', error);
      toast.error(error.response?.data?.message || 'Failed to reject transaction');
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      large_withdrawal: 'Large Withdrawal',
      reversal: 'Reversal',
      exceptional: 'Exceptional Transaction'
    };
    return labels[type] || type;
  };

  const getTypeColor = (type) => {
    const colors = {
      large_withdrawal: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
      reversal: 'text-red-600 bg-red-50 dark:bg-red-900/20',
      exceptional: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20'
    };
    return colors[type] || 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        icon: Clock,
        text: 'Pending',
        class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      },
      approved: {
        icon: CheckCircle,
        text: 'Approved',
        class: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      },
      rejected: {
        icon: XCircle,
        text: 'Rejected',
        class: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      }
    };

    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${badge.class}`}>
        <Icon size={12} />
        {badge.text}
      </span>
    );
  };

  const filteredCount = approvals.length;
  const pendingCount = approvals.filter(a => a.status === 'pending').length;

  return (
    <Card className="mb-6">
      <div className="p-4 sm:p-6 border-b border-ink-200 dark:border-ink-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-ink-800 dark:text-ink-100 flex items-center gap-2">
              <AlertCircle className="text-yellow-600" size={20} />
              Pending Approvals
            </h2>
            <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">
              {pendingCount} transaction{pendingCount !== 1 ? 's' : ''} awaiting approval
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCcw}
            onClick={fetchPendingApprovals}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Type Filter */}
          <div className="flex-1">
            <label className="block text-xs font-medium text-ink-600 dark:text-ink-400 mb-1">
              <Filter size={12} className="inline mr-1" />
              Transaction Type
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-ink-300 dark:border-ink-600 rounded-lg bg-white dark:bg-ink-900 text-ink-900 dark:text-ink-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="large_withdrawal">Large Withdrawals</option>
              <option value="reversal">Reversals</option>
              <option value="exceptional">Exceptional Transactions</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex-1">
            <label className="block text-xs font-medium text-ink-600 dark:text-ink-400 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-ink-300 dark:border-ink-600 rounded-lg bg-white dark:bg-ink-900 text-ink-900 dark:text-ink-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="pending">Pending Only</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="all">All Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Approvals List */}
      <div className="divide-y divide-ink-200 dark:divide-ink-700 max-h-[500px] overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-ink-500">
            <RefreshCcw className="animate-spin mx-auto mb-2" size={24} />
            Loading approvals...
          </div>
        ) : approvals.length === 0 ? (
          <div className="p-8 text-center text-ink-500">
            <AlertCircle className="mx-auto mb-2 text-ink-300" size={48} />
            <p className="font-medium">No approvals found</p>
            <p className="text-sm">
              {statusFilter === 'pending' 
                ? 'All transactions are cleared!' 
                : 'Try adjusting your filters'}
            </p>
          </div>
        ) : (
          approvals.map((approval) => (
            <div
              key={approval.id}
              className="p-4 hover:bg-ink-50 dark:hover:bg-ink-900/50 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                {/* Left - Icon & Type */}
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-3 rounded-lg ${getTypeColor(approval.type)}`}>
                    <TrendingDown size={20} />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Type & Status */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-ink-900 dark:text-ink-100">
                        {getTypeLabel(approval.type)}
                      </span>
                      {getStatusBadge(approval.status)}
                    </div>

                    {/* Transaction Details */}
                    <div className="space-y-1">
                      {/* Reference */}
                      <div className="flex items-center gap-2 text-xs text-ink-600 dark:text-ink-400">
                        <span className="font-mono font-semibold">
                          {approval.reference || approval.transactionReference}
                        </span>
                      </div>

                      {/* Member */}
                      {approval.member && (
                        <div className="flex items-center gap-2 text-xs text-ink-600 dark:text-ink-400">
                          <User size={12} />
                          <span>{approval.member.name || approval.memberName}</span>
                          <span className="text-ink-400">•</span>
                          <span className="font-mono">{approval.member.memberNumber || approval.memberNumber}</span>
                        </div>
                      )}

                      {/* Amount */}
                      <div className="flex items-center gap-2">
                        <DollarSign size={12} className="text-ink-400" />
                        <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                          {formatKES(approval.amount)}
                        </span>
                        {approval.reason && (
                          <>
                            <span className="text-ink-400">•</span>
                            <span className="text-xs text-ink-500">{approval.reason}</span>
                          </>
                        )}
                      </div>

                      {/* Date */}
                      <div className="flex items-center gap-2 text-xs text-ink-500 dark:text-ink-400">
                        <Calendar size={12} />
                        <span>{formatDateTime(approval.createdAt || approval.requestedAt)}</span>
                        {approval.requestedBy && (
                          <>
                            <span className="text-ink-400">•</span>
                            <span>Requested by: {approval.requestedBy}</span>
                          </>
                        )}
                      </div>

                      {/* Rejection Reason */}
                      {approval.status === 'rejected' && approval.rejectionReason && (
                        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-700 dark:text-red-300">
                          <strong>Rejected:</strong> {approval.rejectionReason}
                        </div>
                      )}

                      {/* Approval Info */}
                      {approval.status === 'approved' && approval.approvedBy && (
                        <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded text-xs text-green-700 dark:text-green-300">
                          <strong>Approved by:</strong> {approval.approvedBy} on {formatDateTime(approval.approvedAt)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right - Actions */}
                {approval.status === 'pending' && (
                  <div className="flex sm:flex-col gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20"
                      icon={CheckCircle}
                      onClick={() => handleApprove(approval.id)}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                      icon={XCircle}
                      onClick={() => handleReject(approval.id)}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary Footer */}
      {approvals.length > 0 && (
        <div className="p-4 bg-ink-50 dark:bg-ink-900/50 border-t border-ink-200 dark:border-ink-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-600 dark:text-ink-400">
              Showing {filteredCount} transaction{filteredCount !== 1 ? 's' : ''}
            </span>
            <div className="flex items-center gap-4">
              <span className="text-yellow-600 dark:text-yellow-400 font-semibold">
                {pendingCount} Pending
              </span>
              <span className="text-green-600 dark:text-green-400 font-semibold">
                {approvals.filter(a => a.status === 'approved').length} Approved
              </span>
              <span className="text-red-600 dark:text-red-400 font-semibold">
                {approvals.filter(a => a.status === 'rejected').length} Rejected
              </span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default PendingApprovalsCard;
