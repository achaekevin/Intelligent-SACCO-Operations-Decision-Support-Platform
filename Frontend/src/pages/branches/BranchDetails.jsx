import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Users, Wallet, TrendingUp, MapPin, Mail, Phone, Edit, UserPlus } from 'lucide-react'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import PageHeader from '../../components/common/PageHeader'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import StatCard from '../../components/cards/StatCard'
import { fetchBranchById, fetchBranchStats, clearCurrentBranch } from '../../redux/slices/branchesSlice'
import { formatKES, formatNumber } from '../../utils/format'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

const BranchDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { currentBranch, currentStats, loading } = useSelector((state) => state.branches)
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [showAssignManager, setShowAssignManager] = useState(false)
  const [selectedManager, setSelectedManager] = useState('')
  const [assigningManager, setAssigningManager] = useState(false)

  useEffect(() => {
    dispatch(fetchBranchById(id))
    dispatch(fetchBranchStats(id))
    fetchBranchUsers()

    return () => {
      dispatch(clearCurrentBranch())
    }
  }, [dispatch, id])

  const fetchBranchUsers = async () => {
    setLoadingUsers(true)
    try {
      const token = localStorage.getItem('accessToken')
      const response = await axios.get(`${API_URL}/users?branchId=${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUsers(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch branch users:', error)
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleAssignManager = async (e) => {
    e.preventDefault()
    if (!selectedManager) return

    setAssigningManager(true)
    try {
      const token = localStorage.getItem('accessToken')
      await axios.patch(`${API_URL}/branches/${id}/assign-manager`, 
        { managerId: selectedManager },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success('Manager assigned successfully')
      dispatch(fetchBranchById(id))
      setShowAssignManager(false)
      setSelectedManager('')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign manager')
    } finally {
      setAssigningManager(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading branch details...</div>
  }

  if (!currentBranch) {
    return <div className="text-center py-8">Branch not found</div>
  }

  return (
    <div>
      <PageHeader
        title={currentBranch.name}
        subtitle={`Branch Code: ${currentBranch.code}`}
        actions={
          <div className="flex gap-2">
            <Button 
              icon={Edit} 
              onClick={() => navigate(`/branches/${id}/edit`)}
              variant="secondary"
            >
              Edit Branch
            </Button>
            <Button 
              icon={UserPlus} 
              onClick={() => setShowAssignManager(!showAssignManager)}
            >
              {showAssignManager ? 'Cancel' : 'Assign Manager'}
            </Button>
          </div>
        }
      />

      {/* Assign Manager Form */}
      {showAssignManager && (
        <Card className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Assign Branch Manager</h3>
          <form onSubmit={handleAssignManager} className="flex gap-4">
            <div className="flex-1">
              <select
                value={selectedManager}
                onChange={(e) => setSelectedManager(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select a user to assign as manager</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName} - {user.role}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" disabled={assigningManager}>
              {assigningManager ? 'Assigning...' : 'Assign'}
            </Button>
          </form>
        </Card>
      )}

      {/* Branch Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MapPin className="text-teal-600 dark:text-gold-400" size={20} />
            Branch Information
          </h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Status:</span>
              <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${
                currentBranch.status === 'active' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}>
                {currentBranch.status}
              </span>
            </div>
            {currentBranch.isHeadquarters && (
              <div>
                <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Headquarters
                </span>
              </div>
            )}
            {currentBranch.town && (
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Town:</span>
                <span className="ml-2 text-sm font-medium">{currentBranch.town}</span>
              </div>
            )}
            {currentBranch.county && (
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">County:</span>
                <span className="ml-2 text-sm font-medium">{currentBranch.county}</span>
              </div>
            )}
            {currentBranch.address && (
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Address:</span>
                <p className="text-sm font-medium mt-1">{currentBranch.address}</p>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
          <div className="space-y-3">
            {currentBranch.email && (
              <div className="flex items-center gap-2">
                <Mail className="text-gray-400" size={16} />
                <a href={`mailto:${currentBranch.email}`} className="text-sm hover:underline">
                  {currentBranch.email}
                </a>
              </div>
            )}
            {currentBranch.phone && (
              <div className="flex items-center gap-2">
                <Phone className="text-gray-400" size={16} />
                <a href={`tel:${currentBranch.phone}`} className="text-sm hover:underline">
                  {currentBranch.phone}
                </a>
              </div>
            )}
            {!currentBranch.email && !currentBranch.phone && (
              <p className="text-sm text-gray-500">No contact information available</p>
            )}
          </div>
        </Card>
      </div>

      {/* Statistics */}
      {currentStats && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Branch Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Members"
              value={formatNumber(currentStats.totalMembers || 0)}
              icon={Users}
              iconBg="bg-blue-100 dark:bg-blue-900/30"
              iconColor="text-blue-600 dark:text-blue-400"
            />
            <StatCard
              title="Active Members"
              value={formatNumber(currentStats.activeMembers || 0)}
              icon={Users}
              iconBg="bg-green-100 dark:bg-green-900/30"
              iconColor="text-green-600 dark:text-green-400"
            />
            <StatCard
              title="Total Savings"
              value={formatKES(currentStats.totalSavings || 0)}
              icon={Wallet}
              iconBg="bg-purple-100 dark:bg-purple-900/30"
              iconColor="text-purple-600 dark:text-purple-400"
            />
            <StatCard
              title="Active Loans"
              value={formatNumber(currentStats.activeLoans || 0)}
              icon={TrendingUp}
              iconBg="bg-orange-100 dark:bg-orange-900/30"
              iconColor="text-orange-600 dark:text-orange-400"
            />
          </div>
        </div>
      )}

      {/* Branch Staff */}
      <Card className="mt-6">
        <h3 className="text-lg font-semibold mb-4">Branch Staff</h3>
        {loadingUsers ? (
          <p className="text-sm text-gray-500">Loading staff...</p>
        ) : users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="text-left py-2 px-4 text-sm font-medium">Name</th>
                  <th className="text-left py-2 px-4 text-sm font-medium">Email</th>
                  <th className="text-left py-2 px-4 text-sm font-medium">Role</th>
                  <th className="text-left py-2 px-4 text-sm font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="py-2 px-4 text-sm">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="py-2 px-4 text-sm">{user.email}</td>
                    <td className="py-2 px-4 text-sm">{user.role}</td>
                    <td className="py-2 px-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        user.isActive 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No staff assigned to this branch yet</p>
        )}
      </Card>
    </div>
  )
}

export default BranchDetails
