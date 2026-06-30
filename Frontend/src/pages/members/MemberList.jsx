import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { UserPlus, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'react-toastify'
import PageHeader from '../../components/common/PageHeader'
import DataTable from '../../components/tables/DataTable'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import { formatKES, initials } from '../../utils/format'
import axios from 'axios'

const MemberList = () => {
  const navigate = useNavigate()
  const { list } = useSelector((s) => s.members)
  const [loading, setLoading] = useState(null)

  const handleActivate = async (memberId) => {
    if (!confirm('Are you sure you want to activate this member? This will enable their login and send them an email.')) return
    
    setLoading(memberId)
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/members/${memberId}/activate`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }
      )
      toast.success('Member activated successfully! Email sent to member.')
      // Reload the page to refresh member list
      window.location.reload()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to activate member')
    } finally {
      setLoading(null)
    }
  }

  const handleSuspend = async (memberId) => {
    const reason = prompt('Enter reason for suspension:')
    if (!reason) return

    setLoading(memberId)
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/members/${memberId}/suspend`,
        { reason },
        { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }
      )
      toast.success('Member suspended successfully!')
      window.location.reload()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to suspend member')
    } finally {
      setLoading(null)
    }
  }

  const columns = [
    {
      key: 'name',
      label: 'Member',
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-semibold shrink-0">
            {initials(r.name)}
          </div>
          <div>
            <p className="font-medium text-ink-800 dark:text-ink-50 leading-tight">{r.name}</p>
            <p className="text-xs text-ink-400 leading-tight">{r.memberNo}</p>
          </div>
        </div>
      ),
    },
    { key: 'branch', label: 'Branch' },
    { key: 'phone', label: 'Phone' },
    { key: 'savings', label: 'Savings', render: (r) => formatKES(r.savings) },
    { key: 'activeLoans', label: 'Active Loans' },
    { key: 'status', label: 'Status', render: (r) => <Badge>{r.status}</Badge> },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (r) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/members/${r.id}`)}
            className="text-teal-600 dark:text-gold-400 text-xs font-semibold hover:underline"
          >
            View
          </button>
          {r.status === 'pending' && (
            <button
              onClick={() => handleActivate(r.id)}
              disabled={loading === r.id}
              className="flex items-center gap-1 text-green-600 hover:text-green-700 text-xs font-semibold hover:underline disabled:opacity-50"
              title="Activate member"
            >
              <CheckCircle size={14} />
              {loading === r.id ? 'Activating...' : 'Activate'}
            </button>
          )}
          {r.status === 'active' && (
            <button
              onClick={() => handleSuspend(r.id)}
              disabled={loading === r.id}
              className="flex items-center gap-1 text-red-600 hover:text-red-700 text-xs font-semibold hover:underline disabled:opacity-50"
              title="Suspend member"
            >
              <XCircle size={14} />
              {loading === r.id ? 'Suspending...' : 'Suspend'}
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Members"
        subtitle={`${list.length} registered members across all branches`}
        actions={<Button icon={UserPlus} onClick={() => navigate('/members/register')}>Register Member</Button>}
      />
      <DataTable columns={columns} data={list} title="members" />
    </div>
  )
}

export default MemberList
