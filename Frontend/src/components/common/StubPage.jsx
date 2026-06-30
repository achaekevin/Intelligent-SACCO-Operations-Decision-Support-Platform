import { Construction } from 'lucide-react'
import PageHeader from './PageHeader'

/**
 * Generic placeholder used for modules that are wired into routing/sidebar
 * but not yet fully built out. Swap this out for a real page component
 * following the patterns established in src/pages/members and src/pages/loans.
 */
const StubPage = ({ title, subtitle, sections = [] }) => (
  <div>
    <PageHeader title={title} subtitle={subtitle} />
    <div className="bg-white dark:bg-ink-800 rounded-2xl border border-dashed border-ink-200 dark:border-ink-700 p-10 text-center">
      <div className="w-12 h-12 rounded-xl bg-gold-50 dark:bg-ink-700 flex items-center justify-center mx-auto mb-4">
        <Construction size={22} className="text-gold-500" />
      </div>
      <h3 className="font-semibold text-ink-700 dark:text-ink-100">Module scaffolded — content coming next</h3>
      <p className="text-sm text-ink-400 mt-1.5 max-w-md mx-auto">
        Routing, sidebar access, and layout are already wired up for this page. Build it out using the same
        DataTable / StatCard / ChartCard / form patterns used in Members and Loans.
      </p>
      {sections.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mt-5">
          {sections.map((s) => (
            <span key={s} className="text-xs font-medium px-3 py-1.5 rounded-full bg-ink-50 dark:bg-ink-700 text-ink-500 dark:text-ink-300">
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  </div>
)

export default StubPage
