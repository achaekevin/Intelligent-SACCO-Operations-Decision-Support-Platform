import { useMemo, useState } from 'react'
import { ChevronUp, ChevronDown, Search, Download, FileSpreadsheet, ChevronLeft, ChevronRight } from 'lucide-react'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { SkeletonTable } from '../loaders/Skeleton'
import EmptyState from '../common/EmptyState'
import { classNames } from '../../utils/format'

/**
 * Generic data table.
 * columns: [{ key, label, render?: (row) => node, sortable?: bool }]
 */
const DataTable = ({ columns, data, loading, title = 'records', pageSize = 8, exportable = true }) => {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    if (!search) return data
    const q = search.toLowerCase()
    return data.filter((row) => Object.values(row).some((v) => String(v).toLowerCase().includes(q)))
  }, [data, search])

  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    return [...filtered].sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av
      return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
    })
  }, [filtered, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize)

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(sorted)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, title)
    XLSX.writeFile(wb, `${title}.xlsx`)
  }

  const exportPdf = () => {
    const doc = new jsPDF()
    autoTable(doc, {
      head: [columns.map((c) => c.label)],
      body: sorted.map((row) => columns.map((c) => (c.exportValue ? c.exportValue(row) : row[c.key]))),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [11, 79, 74] },
    })
    doc.save(`${title}.pdf`)
  }

  if (loading) return <SkeletonTable cols={columns.length} />

  return (
    <div className="bg-white dark:bg-ink-800 rounded-2xl shadow-card border border-ink-50 dark:border-ink-700 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-ink-100 dark:border-ink-700">
        <div className="flex items-center gap-2 bg-ink-50 dark:bg-ink-700/50 rounded-lg px-3 py-2 w-full sm:max-w-xs">
          <Search size={16} className="text-ink-400 shrink-0" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder={`Search ${title}...`}
            className="bg-transparent text-sm outline-none w-full placeholder:text-ink-400 text-ink-700 dark:text-ink-100"
          />
        </div>
        {exportable && (
          <div className="flex items-center gap-2">
            <button onClick={exportExcel} className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border border-ink-200 dark:border-ink-600 text-ink-600 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-ink-700">
              <FileSpreadsheet size={14} /> Excel
            </button>
            <button onClick={exportPdf} className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border border-ink-200 dark:border-ink-600 text-ink-600 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-ink-700">
              <Download size={14} /> PDF
            </button>
          </div>
        )}
      </div>

      {sorted.length === 0 ? (
        <EmptyState title={`No ${title} found`} description="Try adjusting your search or filters." />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-ink-50/60 dark:bg-ink-700/30 text-left">
                  {columns.map((col) => (
                    <th key={col.key} className="px-4 py-3 font-semibold text-ink-500 dark:text-ink-300 text-xs uppercase tracking-wide whitespace-nowrap">
                      <button
                        className={classNames('flex items-center gap-1', col.sortable !== false && 'hover:text-teal-600 dark:hover:text-gold-400')}
                        onClick={() => col.sortable !== false && toggleSort(col.key)}
                      >
                        {col.label}
                        {sortKey === col.key && (sortDir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />)}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.map((row, i) => (
                  <tr key={row.id || i} className="border-t border-ink-50 dark:border-ink-700/60 hover:bg-ink-50/60 dark:hover:bg-ink-700/30">
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3 text-ink-700 dark:text-ink-100 whitespace-nowrap">
                        {col.render ? col.render(row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-4 py-3 border-t border-ink-100 dark:border-ink-700">
            <p className="text-xs text-ink-400">
              Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, sorted.length)} of {sorted.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-ink-200 dark:border-ink-600 disabled:opacity-40 text-ink-600 dark:text-ink-200"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs text-ink-500 px-2">{page} / {totalPages}</span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-ink-200 dark:border-ink-600 disabled:opacity-40 text-ink-600 dark:text-ink-200"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default DataTable
