import PageHeader from '../../components/common/PageHeader'
import DataTable from '../../components/tables/DataTable'
import Badge from '../../components/common/Badge'
import { AUDIT_LOGS } from '../../utils/mockData'

const AuditLogs = () => {
  const columns = [
    { key: 'id', label: 'Log ID' },
    { key: 'user', label: 'User' },
    { key: 'action', label: 'Action' },
    { key: 'date', label: 'Date & Time' },
    { key: 'ip', label: 'IP Address' },
    { key: 'status', label: 'Status', render: (r) => <Badge>{r.status}</Badge> },
  ]

  return (
    <div>
      <PageHeader title="Audit Logs" subtitle="System-wide activity, login history, and approval trail" />
      <DataTable columns={columns} data={AUDIT_LOGS} title="audit-logs" />
    </div>
  )
}

export default AuditLogs
