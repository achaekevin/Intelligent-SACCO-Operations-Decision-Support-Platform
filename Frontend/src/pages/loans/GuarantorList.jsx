import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { 
  Search, Plus, X, CheckCircle, XCircle, AlertTriangle, 
  TrendingUp, Users, DollarSign, UserCheck, Shield
} from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import DataTable from '../../components/tables/DataTable'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import Modal from '../../components/modals/Modal'
import Card from '../../components/common/Card'
import { formatKES } from '../../utils/format'
import { toast } from 'react-hot-toast'
import api from '../../services/api'

const GuarantorList = () => {
  const { user } = useSelector((s) => s.auth)
  const [guarantors, setGuarantors] = useState([])
  const [loans, setLoans] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    totalLiability: 0
  })

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Add Guarantor Modal
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedLoan, setSelectedLoan] = useState(null)
  const [selectedMember, setSelectedMember] = useState(null)
  const [guaranteedAmount, setGuaranteedAmount] = useState('')
  const [memberSearch, setMemberSearch] = useState('')
  const [addingGuarantor, setAddingGuarantor] = useState(false)

  // Liability Modal
  const [showLiabilityModal, setShowLiabilityModal] = useState(false)
  const [selectedGuarantorLiability, setSelectedGuarantorLiability] = useState(null)
  const [loadingLiability, setLoadingLiability] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [guarantorsRes, loansRes, membersRes] = await Promise.all([
        api.get('/api/v1/loans/guarantors'),
        api.get('/api/v1/loans?status=pending'),
        api.get('/api/v1/members?status=active')
      ])

      const guarantorData = guarantorsRes.data.data || []
      setGuarantors(guarantorData)
      setLoans(loansRes.data.data || [])
      setMembers(membersRes.data.data || [])

      // Calculate stats
      const totalLiability = guarantorData.reduce((sum, g) => sum + parseFloat(g.remainingLiability || 0), 0)
      setStats({
        total: guarantorData.length,
        pending: guarantorData.filter(g => g.status === 'pending').length,
        accepted: guarantorData.filter(g => g.status === 'accepted').length,
        totalLiability
      })
    } catch (error) {
      toast.error('Failed to fetch guarantor data')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddGuarantor = async () => {
    if (!selectedLoan || !selectedMember || !guaranteedAmount) {
      toast.error('Please fill all required fields')
      return
    }

    if (parseFloat(guaranteedAmount) <= 0) {
      toast.error('Guaranteed amount must be greater than 0')
      return
    }

    try {
      setAddingGuarantor(true)
      await api.post(`/api/v1/loans/${selectedLoan.id}/guarantors`, {
        memberId: selectedMember.id,
        amountGuaranteed: parseFloat(guaranteedAmount)
      })
      toast.success('Guarantor added successfully')
      setShowAddModal(false)
      resetAddForm()
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add guarantor')
    } finally {
      setAddingGuarantor(false)
    }
  }

  const resetAddForm = () => {
    setSelectedLoan(null)
    setSelectedMember(null)
    setGuaranteedAmount('')
    setMemberSearch('')
  }

  const handleAccept = async (guarantorId) => {
    if (!confirm('Accept this guarantor request?')) return
    try {
      await api.patch(`/api/v1/loans/guarantors/${guarantorId}/accept`)
      toast.success('Guarantor request accepted')
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept')
    }
  }

  const handleDecline = async (guarantorId) => {
    if (!confirm('Decline this guarantor request?')) return
    try {
      await api.patch(`/api/v1/loans/guarantors/${guarantorId}/decline`)
      toast.success('Guarantor request declined')
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to decline')
    }
  }

  const handleRelease = async (guarantorId) => {
    if (!confirm('Release this guarantor?')) return
    try {
      await api.patch(`/api/v1/loans/guarantors/${guarantorId}/release`)
      toast.success('Guarantor released')
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to release')
    }
  }

  const viewLiability = async (memberId) => {
    try {
      setLoadingLiability(true)
      setShowLiabilityModal(true)
      const response = await api.get(`/api/v1/loans/guarantors/${memberId}/liability`)
      setSelectedGuarantorLiability(response.data.data)
    } catch (error) {
      toast.error('Failed to fetch liability details')
      console.error(error)
      setShowLiabilityModal(false)
    } finally {
      setLoadingLiability(false)
    }
  }

  // Filter guarantors
  const filteredGuarantors = guarantors.filter((g) => {
    const matchesSearch = 
      g.guarantor?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.guarantor?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.guarantor?.memberNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.loan?.member?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.loan?.member?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.loan?.loanNumber?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || g.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Filter members for selection
  const filteredMembers = members.filter((m) => {
    const searchLower = memberSearch.toLowerCase()
    return (
      m.firstName?.toLowerCase().includes(searchLower) ||
      m.lastName?.toLowerCase().includes(searchLower) ||
      m.memberNumber?.toLowerCase().includes(searchLower) ||
      m.email?.toLowerCase().includes(searchLower)
    )
  }).slice(0, 10)

  const columns = [
    { 
      key: 'guarantor', 
      label: 'Guarantor',
      render: (r) => (
        <div>
          <div className="font-medium text-gray-900">
            {r.guarantor?.firstName} {r.guarantor?.lastName}
          </div>
          <div className="text-sm text-gray-500">{r.guarantor?.memberNumber}</div>
        </div>
      )
    },
    { 
      key: 'borrower', 
      label: 'Borrower',
      render: (r) => (
        <div>
          <div className="font-medium text-gray-900">
            {r.loan?.member?.firstName} {r.loan?.member?.lastName}
          </div>
          <div className="text-sm text-gray-500">{r.loan?.member?.memberNumber}</div>
        </div>
      )
    },
    { 
      key: 'loan', 
      label: 'Loan',
      render: (r) => (
        <div>
          <div className="font-medium text-gray-900">{r.loan?.loanNumber}</div>
          <div className="text-sm text-gray-500">{r.loan?.type}</div>
        </div>
      )
    },
    { 
      key: 'amountGuaranteed', 
      label: 'Amount Guaranteed', 
      render: (r) => (
        <span className="font-medium text-gray-900">
          {formatKES(r.amountGuaranteed)}
        </span>
      )
    },
    { 
      key: 'remainingLiability', 
      label: 'Remaining Liability', 
      render: (r) => (
        <span className={`font-medium ${parseFloat(r.remainingLiability) > 0 ? 'text-orange-600' : 'text-green-600'}`}>
          {formatKES(r.remainingLiability)}
        </span>
      )
    },
    { 
      key: 'status', 
      label: 'Status', 
      render: (r) => {
        const statusConfig = {
          pending: { color: 'yellow', icon: AlertTriangle },
          accepted: { color: 'green', icon: CheckCircle },
          declined: { color: 'red', icon: XCircle },
          released: { color: 'gray', icon: Shield }
        }
        const config = statusConfig[r.status] || statusConfig.pending
        const Icon = config.icon
        return (
          <Badge color={config.color}>
            <Icon className="w-3 h-3 mr-1" />
            {r.status}
          </Badge>
        )
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div className="flex gap-2">
          {r.status === 'pending' && user?.role === 'member' && r.guarantor?.id === user?.memberId && (
            <>
              <button
                onClick={() => handleAccept(r.id)}
                className="text-green-600 hover:text-green-700 text-sm font-medium"
              >
                Accept
              </button>
              <button
                onClick={() => handleDecline(r.id)}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Decline
              </button>
            </>
          )}
          {['accepted'].includes(r.status) && ['SACCO Admin', 'Loan Officer'].includes(user?.role) && (
            <button
              onClick={() => handleRelease(r.id)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Release
            </button>
          )}
          <button
            onClick={() => viewLiability(r.guarantor?.id)}
            className="text-purple-600 hover:text-purple-700 text-sm font-medium"
          >
            View Liability
          </button>
        </div>
      )
    }
  ]

  return (
    <div>
      <PageHeader 
        title="Guarantor Management" 
        subtitle="Track guarantor commitments, validate shares, and manage liability across all loans"
        action={
          ['SACCO Admin', 'Loan Officer'].includes(user?.role) && (
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Guarantor
            </Button>
          )
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Guarantors</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Requests</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Accepted</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.accepted}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Liability</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{formatKES(stats.totalLiability)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by guarantor, borrower, loan number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="declined">Declined</option>
            <option value="released">Released</option>
          </select>
        </div>
      </Card>

      {/* Table */}
      <DataTable 
        columns={columns} 
        data={filteredGuarantors} 
        title="guarantors"
        loading={loading}
      />

      {/* Add Guarantor Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false)
          resetAddForm()
        }}
        title="Add Guarantor"
      >
        <div className="space-y-4">
          {/* Select Loan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loan Application <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedLoan?.id || ''}
              onChange={(e) => {
                const loan = loans.find(l => l.id === e.target.value)
                setSelectedLoan(loan)
                setGuaranteedAmount(loan ? String(parseFloat(loan.principalAmount)) : '')
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a loan application</option>
              {loans.map((loan) => (
                <option key={loan.id} value={loan.id}>
                  {loan.loanNumber} - {loan.member?.firstName} {loan.member?.lastName} - {formatKES(loan.principalAmount)}
                </option>
              ))}
            </select>
          </div>

          {/* Search & Select Member */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Guarantor Member <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Search by name, member number, or email..."
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
            />
            
            {memberSearch && (
              <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((member) => (
                    <div
                      key={member.id}
                      onClick={() => {
                        setSelectedMember(member)
                        setMemberSearch(`${member.firstName} ${member.lastName} (${member.memberNumber})`)
                      }}
                      className={`p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-200 last:border-b-0 ${
                        selectedMember?.id === member.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="font-medium text-gray-900">
                        {member.firstName} {member.lastName}
                      </div>
                      <div className="text-sm text-gray-600">
                        {member.memberNumber} • {member.email}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">No members found</div>
                )}
              </div>
            )}

            {selectedMember && !memberSearch.includes(selectedMember.memberNumber) && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="font-medium text-green-900">
                  Selected: {selectedMember.firstName} {selectedMember.lastName}
                </div>
                <div className="text-sm text-green-700">
                  {selectedMember.memberNumber} • {selectedMember.email}
                </div>
              </div>
            )}
          </div>

          {/* Guaranteed Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount Guaranteed (KES) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              placeholder="0.00"
              value={guaranteedAmount}
              onChange={(e) => setGuaranteedAmount(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              step="0.01"
            />
            {selectedLoan && (
              <p className="text-sm text-gray-600 mt-1">
                Loan amount: {formatKES(selectedLoan.principalAmount)}
              </p>
            )}
          </div>

          {/* Validation Info */}
          {selectedMember && selectedLoan && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Validation</h4>
              <p className="text-sm text-blue-700">
                ✓ Guarantor will be validated against their savings balance
              </p>
              <p className="text-sm text-blue-700">
                ✓ Guaranteed amount cannot exceed guarantor's available savings
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleAddGuarantor}
              disabled={!selectedLoan || !selectedMember || !guaranteedAmount || addingGuarantor}
              className="flex-1"
            >
              {addingGuarantor ? 'Adding...' : 'Add Guarantor'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddModal(false)
                resetAddForm()
              }}
              disabled={addingGuarantor}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Liability Modal */}
      <Modal
        isOpen={showLiabilityModal}
        onClose={() => {
          setShowLiabilityModal(false)
          setSelectedGuarantorLiability(null)
        }}
        title="Guarantor Liability Details"
      >
        {loadingLiability ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading liability details...</p>
          </div>
        ) : selectedGuarantorLiability ? (
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-blue-50">
                <p className="text-sm text-blue-700">Total Loans</p>
                <p className="text-xl font-bold text-blue-900 mt-1">
                  {selectedGuarantorLiability.summary.totalLoansGuaranteed}
                </p>
              </Card>
              <Card className="bg-purple-50">
                <p className="text-sm text-purple-700">Total Guaranteed</p>
                <p className="text-xl font-bold text-purple-900 mt-1">
                  {formatKES(selectedGuarantorLiability.summary.totalAmountGuaranteed)}
                </p>
              </Card>
              <Card className="bg-orange-50">
                <p className="text-sm text-orange-700">Remaining Liability</p>
                <p className="text-xl font-bold text-orange-900 mt-1">
                  {formatKES(selectedGuarantorLiability.summary.totalRemainingLiability)}
                </p>
              </Card>
            </div>

            {/* Detailed List */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Guaranteed Loans</h4>
              <div className="space-y-3">
                {selectedGuarantorLiability.guarantors.map((g) => (
                  <div key={g.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium text-gray-900">{g.loan?.loanNumber}</div>
                        <div className="text-sm text-gray-600">
                          Borrower: {g.loan?.member?.firstName} {g.loan?.member?.lastName}
                        </div>
                      </div>
                      <Badge color={g.status === 'accepted' ? 'green' : 'yellow'}>
                        {g.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <p className="text-xs text-gray-500">Amount Guaranteed</p>
                        <p className="font-medium text-gray-900">{formatKES(g.amountGuaranteed)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Remaining Liability</p>
                        <p className="font-medium text-orange-600">{formatKES(g.remainingLiability)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}

export default GuarantorList
