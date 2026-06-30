const ChartCard = ({ title, subtitle, action, children, height = 300 }) => (
  <div className="bg-white dark:bg-ink-800 rounded-2xl p-5 shadow-card border border-ink-50 dark:border-ink-700">
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="font-semibold text-ink-800 dark:text-ink-50 text-sm">{title}</h3>
        {subtitle && <p className="text-xs text-ink-400 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
    <div style={{ width: '100%', height }}>{children}</div>
  </div>
)

export default ChartCard
