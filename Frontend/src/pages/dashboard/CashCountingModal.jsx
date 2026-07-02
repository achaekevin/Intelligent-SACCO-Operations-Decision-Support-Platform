import { useState, useEffect } from 'react';
import { X, Calculator } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Button from '../../components/common/Button';
import { formatKES } from '../../utils/format';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const DENOMINATIONS = [
  { value: 1000, label: 'KES 1,000' },
  { value: 500, label: 'KES 500' },
  { value: 200, label: 'KES 200' },
  { value: 100, label: 'KES 100' },
  { value: 50, label: 'KES 50' },
  { value: 20, label: 'KES 20' },
  { value: 10, label: 'KES 10' },
  { value: 5, label: 'KES 5' },
  { value: 1, label: 'KES 1' }
];

const CashCountingModal = ({ onClose, onSubmit, expectedCash }) => {
  const [counts, setCounts] = useState(
    DENOMINATIONS.reduce((acc, denom) => ({ ...acc, [denom.value]: 0 }), {})
  );
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Calculate total counted cash
  const totalCounted = DENOMINATIONS.reduce(
    (sum, denom) => sum + (denom.value * (counts[denom.value] || 0)),
    0
  );

  // Calculate variance
  const variance = totalCounted - expectedCash;
  const variancePercent = expectedCash > 0 ? ((variance / expectedCash) * 100).toFixed(2) : 0;

  const handleCountChange = (denomValue, value) => {
    const numValue = parseInt(value) || 0;
    setCounts(prev => ({ ...prev, [denomValue]: Math.max(0, numValue) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('accessToken');
      
      // Format denominations as object with string keys (matching backend validation)
      const denominationsObject = {};
      DENOMINATIONS.forEach(denom => {
        denominationsObject[denom.value.toString()] = counts[denom.value] || 0;
      });

      await axios.post(
        `${API_URL}/teller/cash-counting`,
        {
          date: new Date().toISOString(),
          denominations: denominationsObject,
          totalCounted,
          notes: notes.trim() || ''
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Cash counting submitted successfully');
      onSubmit();
    } catch (error) {
      console.error('Failed to submit cash counting:', error);
      toast.error(error.response?.data?.message || 'Failed to submit cash counting');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-ink-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-ink-200 dark:border-ink-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Calculator className="text-purple-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-ink-900 dark:text-ink-100">
                Cash Counting & Reconciliation
              </h2>
              <p className="text-sm text-ink-500 dark:text-ink-400">
                Count physical cash and reconcile with system records
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
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Denomination Grid */}
            <div>
              <label className="block text-sm font-semibold text-ink-700 dark:text-ink-300 mb-3">
                Count Each Denomination
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DENOMINATIONS.map((denom) => (
                  <div
                    key={denom.value}
                    className="flex items-center justify-between p-3 bg-ink-50 dark:bg-ink-900/50 rounded-lg"
                  >
                    <span className="font-medium text-ink-700 dark:text-ink-300">
                      {denom.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        value={counts[denom.value]}
                        onChange={(e) => handleCountChange(denom.value, e.target.value)}
                        className="w-20 px-3 py-1.5 text-center border border-ink-300 dark:border-ink-600 rounded-lg bg-white dark:bg-ink-800 text-ink-900 dark:text-ink-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <span className="text-sm text-ink-500 dark:text-ink-400 w-24 text-right">
                        = {formatKES(denom.value * (counts[denom.value] || 0))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-ink-600 dark:text-ink-300">
                    Expected Cash (System):
                  </span>
                  <span className="text-lg font-bold text-ink-900 dark:text-ink-100">
                    {formatKES(expectedCash)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-ink-600 dark:text-ink-300">
                    Total Counted:
                  </span>
                  <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {formatKES(totalCounted)}
                  </span>
                </div>
                <div className="pt-2 border-t border-purple-200 dark:border-purple-700">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-ink-700 dark:text-ink-300">
                      Variance:
                    </span>
                    <div className="text-right">
                      <span
                        className={`text-xl font-bold ${
                          variance === 0
                            ? 'text-green-600 dark:text-green-400'
                            : variance > 0
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {variance >= 0 ? '+' : ''}{formatKES(variance)}
                      </span>
                      <div className="text-xs text-ink-500 dark:text-ink-400">
                        {variance >= 0 ? '+' : ''}{variancePercent}%
                      </div>
                    </div>
                  </div>
                  {Math.abs(variance) > 0 && (
                    <div className="mt-2 text-xs text-center">
                      <span
                        className={`px-2 py-1 rounded-full font-medium ${
                          Math.abs(variance) > 100
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                        }`}
                      >
                        {Math.abs(variance) > 100
                          ? 'Significant variance detected'
                          : 'Minor variance'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label
                htmlFor="notes"
                className="block text-sm font-semibold text-ink-700 dark:text-ink-300 mb-2"
              >
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about discrepancies, damaged notes, etc."
                rows={3}
                className="w-full px-4 py-2.5 border border-ink-300 dark:border-ink-600 rounded-lg bg-white dark:bg-ink-900 text-ink-900 dark:text-ink-100 placeholder-ink-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-ink-200 dark:border-ink-700 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={submitting}
            disabled={totalCounted === 0}
          >
            Submit Cash Count
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CashCountingModal;
