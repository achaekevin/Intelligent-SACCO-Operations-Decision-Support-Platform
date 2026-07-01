const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-ink-800 rounded-2xl p-6 shadow-card border border-ink-50 dark:border-ink-700 ${className}`}>
      {children}
    </div>
  )
}

export default Card
