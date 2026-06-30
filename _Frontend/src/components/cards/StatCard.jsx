import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { classNames } from '../../utils/format'

const StatCard = ({ label, value, icon: Icon, trend, trendValue, accent = 'teal' }) => {
  const isUp = trend === 'up'
  const accents = {
    teal: 'bg-teal-50 text-teal-600 dark:bg-teal-900/40 dark:text-teal-300',
    gold: 'bg-gold-50 text-gold-600 dark:bg-gold-900/30 dark:text-gold-300',
    info: 'bg-info-light text-info',
    danger: 'bg-danger-light text-danger',
  }

  return (
    <div className="bg-white dark:bg-ink-800 rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-shadow border border-ink-50 dark:border-ink-700 relative overflow-hidden">
      <div className="absolute top-0 left-0 h-1 w-full bg-ledger-stripe" />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-ink-400 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-display font-bold text-ink-800 dark:text-ink-50 mt-2">{value}</p>
        </div>
        {Icon && (
          <div className={classNames('w-11 h-11 rounded-xl flex items-center justify-center shrink-0', accents[accent])}>
            <Icon size={20} />
          </div>
        )}
      </div>
      {trendValue && (
        <div className="flex items-center gap-1 mt-3">
          {isUp ? <ArrowUpRight size={14} className="text-success" /> : <ArrowDownRight size={14} className="text-danger" />}
          <span className={classNames('text-xs font-semibold', isUp ? 'text-success' : 'text-danger')}>{trendValue}</span>
          <span className="text-xs text-ink-400">vs last month</span>
        </div>
      )}
    </div>
  )
}

export default StatCard
