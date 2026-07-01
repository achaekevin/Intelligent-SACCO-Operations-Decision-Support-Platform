import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { UserPlus, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'react-toastify'
import PageHeader from '../../components/common/PageHeader'
import DataTable from '../../components/tables/DataTable'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import { formatKES, initials } from '../../utils/format'
import { fetchMembers } from '../../redux/slices/membersSlice'
import axios from 'axios'

const MemberList = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { list, loading: loadingMembers } = useSelector((s) => s.members)
  const [loading, setLoading] = useState(null)

  // Fetch members on component mount
  useEffect(() => {
    dispatch(fetchMembers())
  }, [dispatch])

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
      // Reload members list
      dispatch(fetchMembers())
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
      dispatch(fetchMembers())
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
      render: (r) => {
        const fullName = `${r.firstName || ''} ${r.lastName || ''}`.trim() || r.name || 'N/A'
        return (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-semibold shrink-0">
              {initials(fullName)}
            </div>
            <div>
              <p className="font-medium text-ink-800 dark:text-ink-50 leading-tight">{fullName}</p>
              <p className="text-xs text-ink-400 leading-tight">{r.memberNumber || r.memberNo || 'N/A'}</p>
            </div>
          </div>
        )
      },
    },
    { 
      key: 'branch', 
      label: 'Branch',
      render: (r) => r.branch?.name || r.branch || 'N/A'
    },
    { 
      key: 'phone', 
      label: 'Phone',
      render: (r) => r.phone || 'N/A'
    },
    { 
      key: 'email', 
      label: 'Email',
      render: (r) => r.email || 'N/A'
    },
    { 
      key: 'status', 
      label: 'Status', 
      render: (r) => <Badge>{r.status || 'unknown'}</Badge> 
    },
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

  if (loadingMembers) {
    return (
      <div>
        <PageHeader title="Members" subtitle="Loading members..." />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      </div>
    )
  }

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
