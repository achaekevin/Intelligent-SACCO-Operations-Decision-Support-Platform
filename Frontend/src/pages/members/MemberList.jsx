import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { UserPlus, CheckCircle, XCircle, Search, Filter } from 'lucide-react'
import { toast } from 'react-hot-toast'
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
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)

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

  // Filter members based on search and status
  const filteredMembers = list.filter(member => {
    const fullName = `${member.firstName || ''} ${member.lastName || ''}`.toLowerCase()
    const memberNumber = (member.memberNumber || member.memberNo || '').toLowerCase()
    const email = (member.email || '').toLowerCase()
    const phone = (member.phone || '').toLowerCase()
    const search = searchTerm.toLowerCase()

    const matchesSearch = !searchTerm || 
      fullName.includes(search) ||
      memberNumber.includes(search) ||
      email.includes(search) ||
      phone.includes(search)

    const matchesStatus = !statusFilter || member.status === statusFilter

    return matchesSearch && matchesStatus
  })

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
        subtitle={`${filteredMembers.length} of ${list.length} members ${statusFilter || searchTerm ? 'match filters' : 'registered'}`}
        actions={<Button icon={UserPlus} onClick={() => navigate('/members/register')}>Register Member</Button>}
      />

      {/* Search and Filters */}
      <div className="mb-4 bg-white dark:bg-ink-800 rounded-lg p-4 shadow-card border border-ink-50 dark:border-ink-700">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, member number, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              showFilters 
                ? 'bg-teal-50 border-teal-500 text-teal-700 dark:bg-teal-900 dark:border-teal-600 dark:text-teal-300' 
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Filter size={18} />
            <span className="font-medium">Filters</span>
            {statusFilter && <span className="bg-teal-500 text-white text-xs px-2 py-0.5 rounded-full">1</span>}
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setStatusFilter('')
                  }}
                  className="text-sm text-teal-600 hover:text-teal-700 dark:text-teal-400 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {filteredMembers.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-ink-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm || statusFilter ? 'No members match your filters' : 'No members registered yet'}
          </p>
        </div>
      ) : (
        <DataTable columns={columns} data={filteredMembers} title="members" />
      )}
    </div>
  )
}

export default MemberList
