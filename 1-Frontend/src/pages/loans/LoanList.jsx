import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Plus, Check, X } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import DataTable from '../../components/tables/DataTable'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import ConfirmDialog from '../../components/modals/ConfirmDialog'
import { updateLoanStatus } from '../../redux/slices/loansSlice'
import { formatKES, formatDate } from '../../utils/format'

const LoanList = () => {
  const { list } = useSelector((s) => s.loans)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [confirm, setConfirm] = useState(null) // { id, action }

  const handleAction = () => {
    if (!confirm) return
    dispatch(updateLoanStatus({ id: confirm.id, status: confirm.action === 'approve' ? 'Approved' : 'Rejected' }))
    toast.success(`Loan ${confirm.action === 'approve' ? 'approved' : 'rejected'}`)
  }

  const columns = [
    { key: 'id', label: 'Loan ID' },
    { key: 'member', label: 'Member' },
    { key: 'type', label: 'Type' },
    { key: 'principal', label: 'Amount', render: (r) => formatKES(r.principal) },
    { key: 'termMonths', label: 'Term', render: (r) => `${r.termMonths} mo` },
    { key: 'applicationDate', label: 'Applied', render: (r) => formatDate(r.applicationDate) },
    { key: 'status', label: 'Status', render: (r) => <Badge>{r.status}</Badge> },
    {
      key: 'actions',
      label: '',
      sortable: false,
      render: (r) => (
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(`/loans/${r.id}`)} className="text-teal-600 dark:text-gold-400 text-xs font-semibold hover:underline">
            View
          </button>
          {r.status === 'Pending' && (
            <>
              <button onClick={() => setConfirm({ id: r.id, action: 'approve' })} className="p-1 rounded text-success hover:bg-success-light" aria-label="Approve">
                <Check size={15} />
              </button>
              <button onClick={() => setConfirm({ id: r.id, action: 'reject' })} className="p-1 rounded text-danger hover:bg-danger-light" aria-label="Reject">
                <X size={15} />
              </button>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Loan Applications"
        subtitle={`${list.length} loan records`}
        actions={<Button icon={Plus} onClick={() => navigate('/loans/apply')}>New Application</Button>}
      />
      <DataTable columns={columns} data={list} title="loans" />
      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={handleAction}
        title={confirm?.action === 'approve' ? 'Approve loan?' : 'Reject loan?'}
        description={`This will mark loan ${confirm?.id} as ${confirm?.action === 'approve' ? 'approved' : 'rejected'}.`}
        confirmLabel={confirm?.action === 'approve' ? 'Approve' : 'Reject'}
        danger={confirm?.action === 'reject'}
      />
    </div>
  )
}

export default LoanList
