import { useState } from 'react';
import { X, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Button from '../../components/common/Button';
import { formatKES, formatDateTime } from '../../utils/format';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const TransactionReviewModal = ({ transaction, onClose, onComplete }) => {
  const [action, setAction] = useState(null); // 'approve' or 'reject'
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!action) {
      toast.error('Please select an action');
      return;
    }

    if (action === 'reject' && !notes.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('accessToken');
      
      await axios.patch(
        `${API_URL}/teller/transactions/${transaction.id}/review`,
        {
          action,
          notes: notes.trim() || null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`Transaction ${action}d successfully`);
      onComplete();
    } catch (error) {
      console.error('Failed to review transaction:', error);
      toast.error(error.response?.data?.message || 'Failed to review transaction');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-ink-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-ink-200 dark:border-ink-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <AlertCircle className="text-yellow-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-ink-900 dark:text-ink-100">
                Review Transaction
              </h2>
              <p className="text-sm text-ink-500 dark:text-ink-400">
                Approve or reject pending transaction
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-ink-100 dark:hover:bg-ink-700 rounded-lg transition-colors"
          >
            <X className="text-ink-500" size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Transaction Details */}
          <div className="p-4 bg-ink-50 dark:bg-ink-900/50 rounded-xl space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-ink-600 dark:text-ink-400">Reference:</span>
              <span className="font-mono text-sm font-medium text-ink-900 dark:text-ink-100">
                {transaction.reference}
              </span>
            </div>
            
            {transaction.member && (
              <div className="flex justify-between">
                <span className="text-sm text-ink-600 dark:text-ink-400">Member:</span>
                <div className="text-right">
                  <div className="font-medium text-ink-900 dark:text-ink-100">
                    {transaction.member.name}
                  </div>
                  <div className="text-xs text-ink-500 dark:text-ink-400">
                    {transaction.member.memberNumber}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-sm text-ink-600 dark:text-ink-400">Type:</span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  transaction.type === 'deposit'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                }`}
              >
                {transaction.type}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-ink-600 dark:text-ink-400">Amount:</span>
              <span
                className={`text-xl font-bold ${
                  transaction.type === 'deposit'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-orange-600 dark:text-orange-400'
                }`}
              >
                {transaction.type === 'deposit' ? '+' : '-'}
                {formatKES(transaction.amount)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-ink-600 dark:text-ink-400">Payment Method:</span>
              <span className="font-medium text-ink-900 dark:text-ink-100">
                {transaction.paymentMethod || 'Cash'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-ink-600 dark:text-ink-400">Date:</span>
              <span className="text-sm text-ink-900 dark:text-ink-100">
                {formatDateTime(transaction.date)}
              </span>
            </div>

            {transaction.description && (
              <div className="pt-2 border-t border-ink-200 dark:border-ink-700">
                <span className="text-sm text-ink-600 dark:text-ink-400 block mb-1">
                  Description:
                </span>
                <p className="text-sm text-ink-900 dark:text-ink-100">
                  {transaction.description}
                </p>
              </div>
            )}
          </div>

          {/* Action Selection */}
          <div>
            <label className="block text-sm font-semibold text-ink-700 dark:text-ink-300 mb-3">
              Select Action
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setAction('approve')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  action === 'approve'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-ink-200 dark:border-ink-700 hover:border-green-300 dark:hover:border-green-700'
                }`}
              >
                <CheckCircle
                  className={`mx-auto mb-2 ${
                    action === 'approve' ? 'text-green-600' : 'text-ink-400'
                  }`}
                  size={32}
                />
                <div className="text-center font-semibold text-ink-900 dark:text-ink-100">
                  Approve
                </div>
              </button>

              <button
                onClick={() => setAction('reject')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  action === 'reject'
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-ink-200 dark:border-ink-700 hover:border-red-300 dark:hover:border-red-700'
                }`}
              >
                <XCircle
                  className={`mx-auto mb-2 ${
                    action === 'reject' ? 'text-red-600' : 'text-ink-400'
                  }`}
                  size={32}
                />
                <div className="text-center font-semibold text-ink-900 dark:text-ink-100">
                  Reject
                </div>
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="review-notes"
              className="block text-sm font-semibold text-ink-700 dark:text-ink-300 mb-2"
            >
              Notes {action === 'reject' && <span className="text-red-500">*</span>}
            </label>
            <textarea
              id="review-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                action === 'reject'
                  ? 'Please provide a reason for rejection...'
                  : 'Add any notes (optional)...'
              }
              rows={3}
              className="w-full px-4 py-2.5 border border-ink-300 dark:border-ink-600 rounded-lg bg-white dark:bg-ink-900 text-ink-900 dark:text-ink-100 placeholder-ink-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-ink-200 dark:border-ink-700 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={submitting}
            disabled={!action || (action === 'reject' && !notes.trim())}
            variant={action === 'reject' ? 'danger' : 'primary'}
          >
            {action === 'approve' ? 'Approve Transaction' : 'Reject Transaction'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TransactionReviewModal;
