import { Target } from 'lucide-react';
import Card from '../../components/common/Card';
import { formatKES, formatNumber } from '../../utils/format';

const TargetsCard = ({ targets }) => {
  if (!targets) return null;

  const targetItems = [
    {
      label: 'Members Served',
      actual: targets.actual.membersServed,
      target: targets.targets.membersServed,
      progress: parseFloat(targets.progress.membersServed),
      format: formatNumber,
      color: 'purple'
    },
    {
      label: 'Total Transactions',
      actual: targets.actual.totalTransactions,
      target: targets.targets.totalTransactions,
      progress: parseFloat(targets.progress.totalTransactions),
      format: formatNumber,
      color: 'blue'
    },
    {
      label: 'Deposits',
      actual: targets.actual.deposits,
      target: targets.targets.deposits,
      progress: parseFloat(targets.progress.deposits),
      format: formatKES,
      color: 'green'
    }
  ];

  const getProgressColor = (progress) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const getProgressTextColor = (progress) => {
    if (progress >= 100) return 'text-green-600 dark:text-green-400';
    if (progress >= 75) return 'text-blue-600 dark:text-blue-400';
    if (progress >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  return (
    <Card className="mb-6">
      <div className="p-4 sm:p-6 border-b border-ink-200 dark:border-ink-700 flex items-center gap-3">
        <div className="p-2 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
          <Target className="text-teal-600" size={24} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-ink-800 dark:text-ink-100">
            Daily Targets
          </h2>
          <p className="text-sm text-ink-500 dark:text-ink-400">
            Track your progress against today's goals
          </p>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {targetItems.map((item) => (
          <div key={item.label} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-ink-700 dark:text-ink-300">
                {item.label}
              </span>
              <div className="text-right">
                <span className={`text-lg font-bold ${getProgressTextColor(item.progress)}`}>
                  {item.progress}%
                </span>
                <div className="text-xs text-ink-500 dark:text-ink-400">
                  {item.format(item.actual)} / {item.format(item.target)}
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-ink-200 dark:bg-ink-700 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${getProgressColor(item.progress)}`}
                style={{ width: `${Math.min(item.progress, 100)}%` }}
              />
            </div>
          </div>
        ))}

        {/* Overall Status */}
        <div className="pt-4 border-t border-ink-200 dark:border-ink-700">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-ink-700 dark:text-ink-300">
              Overall Progress
            </span>
            <span className="text-lg font-bold text-teal-600 dark:text-teal-400">
              {(
                (parseFloat(targets.progress.membersServed) +
                  parseFloat(targets.progress.totalTransactions) +
                  parseFloat(targets.progress.deposits)) /
                3
              ).toFixed(1)}
              %
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TargetsCard;
