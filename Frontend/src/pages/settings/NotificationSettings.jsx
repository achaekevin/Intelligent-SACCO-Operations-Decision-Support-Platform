import { useState, useEffect } from 'react'
import { Send, Users, Mail, MessageSquare, Bell, AlertCircle, DollarSign } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import { toast } from 'react-hot-toast'
import api from '../../services/api'

const NotificationSettings = () => {
  const [members, setMembers] = useState([])
  const [selectedMembers, setSelectedMembers] = useState([])
  const [smsBalance, setSmsBalance] = useState(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    type: 'system',
    title: '',
    message: '',
    channels: ['in_app']
  })

  useEffect(() => {
    fetchMembers()
    fetchSmsBalance()
  }, [])

  const fetchMembers = async () => {
    try {
      const response = await api.get('/api/v1/members?status=active')
      setMembers(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch members:', error)
    }
  }

  const fetchSmsBalance = async () => {
    try {
      const response = await api.get('/api/v1/notifications/sms-balance')
      setSmsBalance(response.data.data)
    } catch (error) {
      console.error('Failed to fetch SMS balance:', error)
    }
  }

  const handleChannelToggle = (channel) => {
    if (formData.channels.includes(channel)) {
      setFormData({
        ...formData,
        channels: formData.channels.filter(c => c !== channel)
      })
    } else {
      setFormData({
        ...formData,
        channels: [...formData.channels, channel]
      })
    }
  }

  const handleMemberToggle = (memberId) => {
    if (selectedMembers.includes(memberId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== memberId))
    } else {
      setSelectedMembers([...selectedMembers, memberId])
    }
  }

  const handleSelectAll = () => {
    if (selectedMembers.length === members.length) {
      setSelectedMembers([])
    } else {
      setSelectedMembers(members.map(m => m.id))
    }
  }

  const handleSendNotification = async () => {
    if (!formData.title || !formData.message) {
      toast.error('Please fill in title and message')
      return
    }

    if (formData.channels.length === 0) {
      toast.error('Please select at least one channel')
      return
    }

    if (selectedMembers.length === 0) {
      toast.error('Please select at least one member')
      return
    }

    try {
      setLoading(true)
      await api.post('/api/v1/notifications', {
        memberIds: selectedMembers,
        type: formData.type,
        title: formData.title,
        message: formData.message,
        channels: formData.channels
      })

      toast.success(`Notification sent to ${selectedMembers.length} members`)
      
      // Reset form
      setFormData({
        type: 'system',
        title: '',
        message: '',
        channels: ['in_app']
      })
      setSelectedMembers([])
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send notification')
    } finally {
      setLoading(false)
    }
  }

  const handleSendSystemNotification = async () => {
    if (!formData.title || !formData.message) {
      toast.error('Please fill in title and message')
      return
    }

    if (!confirm('Send this notification to ALL active members?')) {
      return
    }

    try {
      setLoading(true)
      await api.post('/api/v1/notifications/system', {
        title: formData.title,
        message: formData.message
      })

      toast.success('System notification sent to all members')
      
      // Reset form
      setFormData({
        type: 'system',
        title: '',
        message: '',
        channels: ['in_app']
      })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send system notification')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader 
        title="Notification Settings" 
        subtitle="Send custom notifications to members via in-app, email, and SMS channels"
      />

      {/* SMS Balance Card */}
      {smsBalance && (
        <Card className="mb-6 bg-gradient-to-br from-purple-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">SMS Balance</h3>
                <p className="text-sm text-gray-600">Current SMS credit balance</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-purple-600">
                {smsBalance.balance || 0}
              </p>
              <p className="text-sm text-gray-600">{smsBalance.currency}</p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notification Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Create Notification
            </h3>

            <div className="space-y-4">
              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notification Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="system">System Announcement</option>
                  <option value="transaction">Transaction Alert</option>
                  <option value="loan">Loan Update</option>
                  <option value="member">Member Information</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter notification title"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={255}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.title.length}/255 characters
                </p>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Enter notification message"
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.message.length}/500 characters
                  {formData.channels.includes('sms') && formData.message.length > 160 && (
                    <span className="text-orange-600 ml-2">
                      (SMS will be truncated to 160 characters)
                    </span>
                  )}
                </p>
              </div>

              {/* Channels */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Delivery Channels <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.channels.includes('in_app')}
                      onChange={() => handleChannelToggle('in_app')}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <Bell className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">In-App Notification</span>
                      <p className="text-xs text-gray-600">Show notification within the application</p>
                    </div>
                    <Badge color="blue">Free</Badge>
                  </label>

                  <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.channels.includes('email')}
                      onChange={() => handleChannelToggle('email')}
                      className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                    />
                    <Mail className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">Email Notification</span>
                      <p className="text-xs text-gray-600">Send to member's email address</p>
                    </div>
                    <Badge color="green">Free</Badge>
                  </label>

                  <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.channels.includes('sms')}
                      onChange={() => handleChannelToggle('sms')}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                    />
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">SMS Notification</span>
                      <p className="text-xs text-gray-600">Send text message to member's phone</p>
                    </div>
                    <Badge color="purple">Paid</Badge>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSendNotification}
                  disabled={loading || selectedMembers.length === 0}
                  className="flex-1"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {loading ? 'Sending...' : `Send to ${selectedMembers.length} Selected`}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleSendSystemNotification}
                  disabled={loading}
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Send to All
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Member Selection */}
        <div>
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Select Members
              </h3>
              <Badge color="blue">{selectedMembers.length} selected</Badge>
            </div>

            <button
              onClick={handleSelectAll}
              className="w-full py-2 px-4 mb-3 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
            >
              {selectedMembers.length === members.length ? 'Deselect All' : 'Select All'}
            </button>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {members.map((member) => (
                <label
                  key={member.id}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedMembers.includes(member.id) ? 'bg-blue-50 border-blue-300' : 'border-gray-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(member.id)}
                    onChange={() => handleMemberToggle(member.id)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">
                      {member.firstName} {member.lastName}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {member.memberNumber}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Info Card */}
      <Card className="mt-6 bg-blue-50 border-blue-200">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Notification Tips</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Use "Send to All" for critical system announcements</li>
              <li>• Select specific members for targeted notifications</li>
              <li>• SMS messages are limited to 160 characters</li>
              <li>• In-app and email notifications are free</li>
              <li>• SMS notifications consume SMS credits</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default NotificationSettings
