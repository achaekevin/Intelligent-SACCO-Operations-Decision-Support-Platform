import { classNames } from '../../utils/format'

const VARIANTS = {
  primary: 'bg-teal-600 hover:bg-teal-700 text-white',
  gold: 'bg-gold-400 hover:bg-gold-500 text-ink-900',
  outline: 'border border-ink-200 dark:border-ink-600 text-ink-600 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-ink-700',
  ghost: 'text-ink-600 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-ink-700',
  danger: 'bg-danger hover:bg-danger/90 text-white',
}

const Button = ({ children, variant = 'primary', icon: Icon, className = '', loading, ...rest }) => (
  <button
    className={classNames(
      'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 active:scale-[0.98] hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
      VARIANTS[variant],
      className
    )}
    disabled={loading || rest.disabled}
    {...rest}
  >
    {loading ? (
      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
    ) : (
      Icon && <Icon size={16} />
    )}
    {children}
  </button>
)

export default Button
