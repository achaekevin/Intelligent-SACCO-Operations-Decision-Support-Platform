import { classNames } from '../../utils/format'

const VARIANT_STYLES = {
  success: 'bg-success-light text-success',
  danger: 'bg-danger-light text-danger',
  warning: 'bg-warning-light text-warning',
  info: 'bg-info-light text-info',
  neutral: 'bg-ink-100 text-ink-600 dark:bg-ink-700 dark:text-ink-200',
}

const STATUS_MAP = {
  active: 'success',
  approved: 'success',
  completed: 'success',
  success: 'success',
  'on time': 'success',
  pending: 'warning',
  dormant: 'neutral',
  rejected: 'danger',
  failed: 'danger',
  defaulted: 'danger',
  late: 'warning',
  unread: 'info',
}

const Badge = ({ children, variant }) => {
  const resolved = variant || STATUS_MAP[String(children).toLowerCase()] || 'neutral'
  return (
    <span
      className={classNames(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap',
        VARIANT_STYLES[resolved]
      )}
    >
      {children}
    </span>
  )
}

export default Badge
