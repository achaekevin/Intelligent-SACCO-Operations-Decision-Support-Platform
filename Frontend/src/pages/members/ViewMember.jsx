import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil, Phone, Mail, MapPin, Calendar, FileDown, User, Users } from 'lucide-react'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import PageHeader from '../../components/common/PageHeader'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import DataTable from '../../components/tables/DataTable'
import EmptyState from '../../components/common/EmptyState'
import { formatKES, formatDate, initials } from '../../utils/format'
import MemberTimelineView from '../../components/members/MemberTimelineView'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

const ViewMember = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [member, setMember] = useState(null)
  const [loading, setLoading] = useState(true)
  const [savingsAccounts, setSavingsAccounts] = useState([])
  const [loans, setLoans] = useState([])

  useEffect(() => {
    fetchMemberDetails()
  }, [id])

  const fetchMemberDetails = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const headers = { Authorization: `Bearer ${token}` }

      const memberRes = await axios.get(`${API_URL}/members/${id}`, { headers })
      setMember(memberRes.data.data)

      // Fetch savings accounts
      try {
        const savingsRes = await axios.get(`${API_URL}/savings?memberId=${id}`, { headers })
        setSavingsAccounts(savingsRes.data.data || [])
      } catch (err) {
        console.error('Failed to fetch savings:', err)
      }

      // Fetch loans
      try {
        const loansRes = await axios.get(`${API_URL}/loans?memberId=${id}`, { headers })
        setLoans(loansRes.data.data || [])
      } catch (err) {
        console.error('Failed to fetch loans:', err)
      }
    } catch (error) {
      toast.error('Failed to load member details')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  if (!member) {
    return <EmptyState title="Member not found" description="This member may have been removed." />
  }

  const fullName = `${member.firstName} ${member.lastName}`
  const ordinarySavings = savingsAccounts.find(acc => acc.accountType === 'ordinary')
  const shareCapital = savingsAccounts.find(acc => acc.accountType === 'share_capital')
  const activeLoans = loans.filter(l => l.status === 'disbursed').length

  const loanCols = [
    { key: 'loanNumber', label: 'Loan #' },
    { key: 'product', label: 'Type', render: (r) => r.product?.name || 'N/A' },
    { key: 'principal', label: 'Principal', render: (r) => formatKES(r.principal) },
    { key: 'balance', label: 'Balance', render: (r) => formatKES(r.balance) },
    { key: 'status', label: 'Status', render: (r) => <Badge>{r.status}</Badge> },
  ]

  const nextOfKin = member.nextOfKin?.filter(kin => kin.isPrimary) || []
  const beneficiaries = member.nextOfKin?.filter(kin => kin.isBeneficiary) || []

  return (
    <div>
      <button 
        onClick={() => navigate('/members')} 
        className="flex items-center gap-1.5 text-sm text-ink-500 dark:text-ink-300 hover:text-teal-600 mb-4"
      >
        <ArrowLeft size={15} /> Back to members
      </button>

      <PageHeader
        title={fullName}
        subtitle={`${member.memberNumber} · ${member.branch?.name || 'N/A'}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" icon={FileDown} onClick={() => navigate(`/members/${id}/statement`)}>
              Statement
            </Button>
            <Button icon={Pencil} onClick={() => navigate(`/members/${id}/edit`)}>Edit</Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Member Profile Card */}
        <Card>
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-teal-600 text-white flex items-center justify-center text-2xl font-semibold mb-3">
              {initials(fullName)}
            </div>
            <h3 className="font-semibold text-ink-800 dark:text-ink-50">{fullName}</h3>
            <Badge>{member.status}</Badge>
          </div>
          
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex items-center gap-2 text-ink-500 dark:text-ink-300">
              <Mail size={15} /> {member.email || 'N/A'}
            </div>
            <div className="flex items-center gap-2 text-ink-500 dark:text-ink-300">
              <Phone size={15} /> {member.phone || 'N/A'}
            </div>
            <div className="flex items-center gap-2 text-ink-500 dark:text-ink-300">
              <MapPin size={15} /> {member.branch?.name || 'N/A'}
            </div>
            <div className="flex items-center gap-2 text-ink-500 dark:text-ink-300">
              <Calendar size={15} /> Joined {formatDate(member.joiningDate || member.createdAt)}
            </div>
          </div>

          <hr className="my-4 border-ink-100 dark:border-ink-700" />
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-400">ID Number</span>
              <span className="font-medium text-ink-700 dark:text-ink-100">{member.nationalId || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-400">Date of Birth</span>
              <span className="font-medium text-ink-700 dark:text-ink-100">
                {member.dateOfBirth ? formatDate(member.dateOfBirth) : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-400">Gender</span>
              <span className="font-medium text-ink-700 dark:text-ink-100 capitalize">
                {member.gender || 'N/A'}
              </span>
            </div>
            {member.occupation && (
              <div className="flex justify-between">
                <span className="text-ink-400">Occupation</span>
                <span className="font-medium text-ink-700 dark:text-ink-100">{member.occupation}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Account Balances */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4 content-start">
          <Card>
            <p className="text-xs text-ink-400 uppercase tracking-wide font-medium">Savings Balance</p>
            <p className="text-2xl font-display font-bold text-ink-800 dark:text-ink-50 mt-2">
              {formatKES(ordinarySavings?.balance || 0)}
            </p>
            <p className="text-xs text-ink-400 mt-1">{ordinarySavings?.accountNumber || 'N/A'}</p>
          </Card>
          
          <Card>
            <p className="text-xs text-ink-400 uppercase tracking-wide font-medium">Share Capital</p>
            <p className="text-2xl font-display font-bold text-ink-800 dark:text-ink-50 mt-2">
              {formatKES(shareCapital?.balance || 0)}
            </p>
            <p className="text-xs text-ink-400 mt-1">{shareCapital?.accountNumber || 'N/A'}</p>
          </Card>
          
          <Card className="col-span-2">
            <p className="text-xs text-ink-400 uppercase tracking-wide font-medium">Active Loans</p>
            <p className="text-2xl font-display font-bold text-ink-800 dark:text-ink-50 mt-2">{activeLoans}</p>
          </Card>
        </div>
      </div>

      {/* Next of Kin */}
      {nextOfKin.length > 0 && (
        <Card className="mb-6">
          <h3 className="font-semibold text-ink-800 dark:text-ink-50 mb-4 flex items-center gap-2">
            <User size={18} /> Next of Kin
          </h3>
          {nextOfKin.map((kin, idx) => (
            <div key={idx} className="border-t border-ink-100 dark:border-ink-700 pt-3 first:border-t-0 first:pt-0">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-ink-400">Name:</span>
                  <span className="ml-2 font-medium">{kin.name}</span>
                </div>
                <div>
                  <span className="text-ink-400">Phone:</span>
                  <span className="ml-2 font-medium">{kin.phone}</span>
                </div>
                <div>
                  <span className="text-ink-400">Relationship:</span>
                  <span className="ml-2 font-medium capitalize">{kin.relationship}</span>
                </div>
                {kin.address && (
                  <div>
                    <span className="text-ink-400">Address:</span>
                    <span className="ml-2 font-medium">{kin.address}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Beneficiaries */}
      {beneficiaries.length > 0 && (
        <Card className="mb-6">
          <h3 className="font-semibold text-ink-800 dark:text-ink-50 mb-4 flex items-center gap-2">
            <Users size={18} /> Beneficiaries
          </h3>
          {beneficiaries.map((ben, idx) => (
            <div key={idx} className="border-t border-ink-100 dark:border-ink-700 pt-3 first:border-t-0 first:pt-0">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-ink-400">Name:</span>
                  <span className="ml-2 font-medium">{ben.name}</span>
                </div>
                <div>
                  <span className="text-ink-400">Phone:</span>
                  <span className="ml-2 font-medium">{ben.phone || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-ink-400">Relationship:</span>
                  <span className="ml-2 font-medium capitalize">{ben.relationship}</span>
                </div>
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Loan History */}
      {loans.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-ink-800 dark:text-ink-50 mb-3">Loan History</h3>
          <DataTable columns={loanCols} data={loans} title="member-loans" exportable={false} pageSize={5} />
        </div>
      )}

      {/* Member Lifecycle Timeline */}
      <div className="mt-8">
        <MemberTimelineView memberId={id} />
      </div>
    </div>
  )
}

export default ViewMember
