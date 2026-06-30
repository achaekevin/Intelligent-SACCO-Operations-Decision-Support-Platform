import { useSelector } from 'react-redux'
import PageHeader from '../../components/common/PageHeader'
import DataTable from '../../components/tables/DataTable'
import Badge from '../../components/common/Badge'
import { formatKES } from '../../utils/format'

const GuarantorList = () => {
  const { list: loans } = useSelector((s) => s.loans)
  const { list: members } = useSelector((s) => s.members)

  // Derive a guarantor liability view from loan + member mock data
  const guarantorRecords = loans
    .filter((l) => ['Active', 'Approved', 'Pending'].includes(l.status))
    .slice(0, 25)
    .map((l, i) => {
      const guarantor = members[(i * 3) % members.length]
      const liabilityShare = l.principal / (l.guarantors || 1)
      return {
        id: `${l.id}-G`,
        guarantor: guarantor.name,
        borrower: l.member,
        loanId: l.id,
        amountGuaranteed: liabilityShare,
        remainingLiability: (l.balance || 0) / (l.guarantors || 1),
        status: l.status,
      }
    })

  const columns = [
    { key: 'guarantor', label: 'Guarantor' },
    { key: 'borrower', label: 'Borrower' },
    { key: 'loanId', label: 'Loan' },
    { key: 'amountGuaranteed', label: 'Amount Guaranteed', render: (r) => formatKES(r.amountGuaranteed) },
    { key: 'remainingLiability', label: 'Remaining Liability', render: (r) => formatKES(r.remainingLiability) },
    { key: 'status', label: 'Loan Status', render: (r) => <Badge>{r.status}</Badge> },
  ]

  return (
    <div>
      <PageHeader title="Guarantors" subtitle="Track guarantor commitments and remaining liability across active loans" />
      <DataTable columns={columns} data={guarantorRecords} title="guarantors" />
    </div>
  )
}

export default GuarantorList
