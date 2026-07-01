import { useState, useEffect } from 'react'
import { 
  Bell, Check, CheckCheck, Trash2, Mail, MessageSquare, 
  CreditCard, Users, TrendingUp, AlertCircle, Filter, X
} from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import { toast } from 'react-hot-toast'
import api from '../../services/api'
import { formatDistanceToNow } from 'date-fns'

const Notifications = () => {
  const [notifications, setNotifications] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    read: 0,
    byType: {},
    byChannel: {}
  })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({
    isRead: 'all',
    type: 'all',
    channel: 'all'
  })
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchNotifications()
    fetchStats()
  }, [filter, page])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.append('page', page)
      params.append('limit', 20)
      
      if (filter.isRead !== 'all') {
        params.append('isRead', filter.isRead === 'read')
      }
      if (filter.type !== 'all') {
        params.append('type', filter.type)
      }
      if (filter.channel !== 'all') {
        params.append('channel', filter.channel)
      }

      const response = await api.get(`/api/v1/notifications?${params.toString()}`)
      setNotifications(response.data.data || [])
      setTotalPages(Math.ceil(response.data.total / 20))
    } catch (error) {
      toast.error('Failed to fetch notifications')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/v1/notifications/stats')
      setStats(response.data.data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/api/v1/notifications/${id}/read`)
      toast.success('Marked as read')
      fetchNotifications()
      fetchStats()
    } catch (error) {
      toast.error('Failed to mark as read')
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/api/v1/notifications/read-all')
      toast.success('All notifications marked as read')
      fetchNotifications()
      fetchStats()
    } catch (error) {
      toast.error('Failed to mark all as read')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this notification?')) return
    
    try {
      await api.delete(`/api/v1/notifications/${id}`)
      toast.success('Notification deleted')
      fetchNotifications()
      fetchStats()
    } catch (error) {
      toast.error('Failed to delete notification')
    }
  }

  const getTypeIcon = (type) => {
    const icons = {
      transaction: CreditCard,
      loan: TrendingUp,
      member: Users,
      system: AlertCircle,
    }
    return icons[type] || Bell
  }

  const getChannelIcon = (channel) => {
    const icons = {
      in_app: Bell,
      email: Mail,
      sms: MessageSquare,
    }
    return icons[channel] || Bell
  }

  const getTypeColor = (type) => {
    const colors = {
      transaction: 'blue',
      loan: 'purple',
      member: 'green',
      system: 'orange',
    }
    return colors[type] || 'gray'
  }

  return (
    <div>
      <PageHeader 
        title="Notifications" 
        subtitle="Stay updated with in-app, email, and SMS notifications"
        action={
          stats.unread > 0 && (
            <Button onClick={handleMarkAllRead} size="sm">
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
          )
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unread</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{stats.unread}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Read</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.read}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In-App</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {stats.byChannel.in_app || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Bell className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filter.isRead}
              onChange={(e) => {
                setFilter({ ...filter, isRead: e.target.value })
                setPage(1)
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              value={filter.type}
              onChange={(e) => {
                setFilter({ ...filter, type: e.target.value })
                setPage(1)
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="transaction">Transaction</option>
              <option value="loan">Loan</option>
              <option value="member">Member</option>
              <option value="system">System</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Channel
            </label>
            <select
              value={filter.channel}
              onChange={(e) => {
                setFilter({ ...filter, channel: e.target.value })
                setPage(1)
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Channels</option>
              <option value="in_app">In-App</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
            </select>
          </div>
        </div>

        {(filter.isRead !== 'all' || filter.type !== 'all' || filter.channel !== 'all') && (
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFilter({ isRead: 'all', type: 'all', channel: 'all' })
                setPage(1)
              }}
            >
              <X className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        )}
      </Card>

      {/* Notifications List */}
      {loading ? (
        <Card>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading notifications...</p>
          </div>
        </Card>
      ) : notifications.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-600">You're all caught up!</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const TypeIcon = getTypeIcon(notification.type)
            const ChannelIcon = getChannelIcon(notification.channel)
            const typeColor = getTypeColor(notification.type)

            return (
              <Card 
                key={notification.id}
                className={`hover:shadow-md transition-all ${
                  !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 bg-${typeColor}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <TypeIcon className={`w-6 h-6 text-${typeColor}-600`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {notification.title}
                        </h3>
                        <Badge color={typeColor}>
                          {notification.type}
                        </Badge>
                        <div className="flex items-center gap-1 text-gray-500">
                          <ChannelIcon className="w-4 h-4" />
                          <span className="text-xs">{notification.channel}</span>
                        </div>
                      </div>

                      {!notification.isRead && (
                        <div className="w-3 h-3 bg-blue-600 rounded-full flex-shrink-0"></div>
                      )}
                    </div>

                    <p className="text-gray-700 mb-3">
                      {notification.message}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>

                      <div className="flex gap-2">
                        {!notification.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                          >
                            <Check className="w-4 h-4" />
                            Mark Read
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          
          <span className="text-gray-700">
            Page {page} of {totalPages}
          </span>
          
          <Button
            variant="outline"
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Notification Channels Info */}
      <Card className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Notification Channels
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">In-App</h4>
              <p className="text-sm text-gray-600">
                Real-time notifications within the application
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Email</h4>
              <p className="text-sm text-gray-600">
                Detailed notifications sent to your email address
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">SMS</h4>
              <p className="text-sm text-gray-600">
                Instant text messages for critical updates
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default Notifications
