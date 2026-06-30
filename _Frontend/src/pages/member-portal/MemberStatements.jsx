import { FileDown } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import Button from '../../components/common/Button'
import { formatDate } from '../../utils/format'

const STATEMENTS = [
  { id: 'STM-2026-06', period: 'June 2026', generated: '2026-06-20' },
  { id: 'STM-2026-05', period: 'May 2026', generated: '2026-05-31' },
  { id: 'STM-2026-04', period: 'April 2026', generated: '2026-04-30' },
  { id: 'STM-2026-03', period: 'March 2026', generated: '2026-03-31' },
]

const MemberStatements = () => (
  <div>
    <PageHeader title="Statements" subtitle="Download your monthly account statements" />
    <div className="bg-white dark:bg-ink-800 rounded-2xl shadow-card border border-ink-50 dark:border-ink-700 divide-y divide-ink-50 dark:divide-ink-700/60">
      {STATEMENTS.map((s) => (
        <div key={s.id} className="flex items-center justify-between p-4">
          <div>
            <p className="text-sm font-medium text-ink-800 dark:text-ink-50">{s.period} Statement</p>
            <p className="text-xs text-ink-400 mt-0.5">Generated {formatDate(s.generated)}</p>
          </div>
          <Button variant="outline" icon={FileDown}>Download PDF</Button>
        </div>
      ))}
    </div>
  </div>
)

export default MemberStatements
