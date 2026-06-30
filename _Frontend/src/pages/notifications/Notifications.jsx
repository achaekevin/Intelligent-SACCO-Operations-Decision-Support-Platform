import { useDispatch, useSelector } from 'react-redux'
import { Bell, Check, Trash2, MessageSquare, Mail as MailIcon } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import EmptyState from '../../components/common/EmptyState'
import { markAsRead, markAllAsRead, deleteNotification } from '../../redux/slices/notificationsSlice'
import { formatDate, classNames } from '../../utils/format'

const CHANNEL_ICON = { System: Bell, SMS: MessageSquare, Email: MailIcon }

const Notifications = () => {
  const dispatch = useDispatch()
  const { list } = useSelector((s) => s.notifications)
  const unread = list.filter((n) => !n.read).length

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle={`${unread} unread of ${list.length} total`}
        actions={<Button variant="outline" icon={Check} onClick={() => dispatch(markAllAsRead())}>Mark all as read</Button>}
      />

      {list.length === 0 ? (
        <EmptyState title="No notifications" description="You're all caught up." />
      ) : (
        <div className="bg-white dark:bg-ink-800 rounded-2xl shadow-card border border-ink-50 dark:border-ink-700 divide-y divide-ink-50 dark:divide-ink-700/60 overflow-hidden">
          {list.map((n) => {
            const Icon = CHANNEL_ICON[n.channel] || Bell
            return (
              <div key={n.id} className={classNames('flex items-start gap-3 p-4', !n.read && 'bg-teal-50/40 dark:bg-ink-700/30')}>
                <div className="w-9 h-9 rounded-lg bg-teal-50 dark:bg-ink-700 flex items-center justify-center shrink-0 text-teal-600 dark:text-gold-400">
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-ink-800 dark:text-ink-50">{n.title}</p>
                    {!n.read && <Badge variant="info">New</Badge>}
                    <Badge variant="neutral">{n.channel}</Badge>
                  </div>
                  <p className="text-sm text-ink-400 mt-0.5">{n.body}</p>
                  <p className="text-xs text-ink-300 mt-1">{formatDate(n.date)}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!n.read && (
                    <button onClick={() => dispatch(markAsRead(n.id))} className="p-2 rounded-lg text-ink-400 hover:text-success hover:bg-success-light" aria-label="Mark as read">
                      <Check size={15} />
                    </button>
                  )}
                  <button onClick={() => dispatch(deleteNotification(n.id))} className="p-2 rounded-lg text-ink-400 hover:text-danger hover:bg-danger-light" aria-label="Delete">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Notifications
