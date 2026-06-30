import { Inbox } from 'lucide-react'

const EmptyState = ({ icon: Icon = Inbox, title = 'Nothing here yet', description, action }) => (
  <div className="flex flex-col items-center justify-center text-center py-16 px-6">
    <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-ink-700 flex items-center justify-center mb-4">
      <Icon size={26} className="text-teal-500 dark:text-gold-400" />
    </div>
    <h3 className="font-semibold text-ink-700 dark:text-ink-50">{title}</h3>
    {description && <p className="text-sm text-ink-400 mt-1 max-w-sm">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
)

export default EmptyState
