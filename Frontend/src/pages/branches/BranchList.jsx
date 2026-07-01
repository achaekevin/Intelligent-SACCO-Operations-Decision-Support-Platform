import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import PageHeader from '../../components/common/PageHeader'
import DataTable from '../../components/tables/DataTable'
import Button from '../../components/common/Button'
import { fetchBranches, removeBranch } from '../../redux/slices/branchesSlice'
import { formatKES, formatNumber } from '../../utils/format'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

const BranchList = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { list: branches, loading } = useSelector((state) => state.branches)

  useEffect(() => {
    dispatch(fetchBranches())
  }, [dispatch])

  const handleDelete = async (branchId) => {
    if (!confirm('Are you sure you want to delete this branch? This action cannot be undone.')) return

    try {
      const token = localStorage.getItem('accessToken')
      await axios.delete(`${API_URL}/branches/${branchId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      dispatch(removeBranch(branchId))
      toast.success('Branch deleted successfully')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete branch')
    }
  }

  const columns = [
    { key: 'name', label: 'Branch' },
    { key: 'code', label: 'Code' },
    { key: 'town', label: 'Town' },
    { key: 'county', label: 'County' },
    { key: 'phone', label: 'Phone' },
    { key: 'status', label: 'Status', render: (r) => (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${
        r.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
      }`}>
        {r.status}
      </span>
    )},
    {
      key: 'actions',
      label: '',
      sortable: false,
      render: (r) => (
        <div className="flex gap-2">
          <button 
            onClick={() => navigate(`/branches/${r.id}`)} 
            className="text-teal-600 dark:text-gold-400 text-xs font-semibold hover:underline"
          >
            View
          </button>
          <button 
            onClick={() => navigate(`/branches/${r.id}/edit`)} 
            className="text-blue-600 dark:text-blue-400 hover:underline"
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button 
            onClick={() => handleDelete(r.id)} 
            className="text-red-600 dark:text-red-400 hover:underline"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Branches"
        subtitle={`${branches.length} branches nationwide`}
        actions={<Button icon={Plus} onClick={() => navigate('/branches/create')}>Create Branch</Button>}
      />
      {loading ? (
        <div className="text-center py-8">Loading branches...</div>
      ) : (
        <DataTable columns={columns} data={branches} title="branches" exportable />
      )}
    </div>
  )
}

export default BranchList
