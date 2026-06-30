import { useEffect } from 'react'
import { X } from 'lucide-react'

const Modal = ({ open, onClose, title, children, footer, size = 'md' }) => {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className={`relative bg-white dark:bg-ink-800 rounded-2xl shadow-card-hover w-full ${sizes[size]} max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-100 dark:border-ink-700 shrink-0">
          <h2 className="font-display font-semibold text-lg text-ink-800 dark:text-ink-50">{title}</h2>
          <button onClick={onClose} className="text-ink-400 hover:text-ink-700 dark:hover:text-white p-1 rounded-lg" aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="px-5 py-4 overflow-y-auto">{children}</div>
        {footer && <div className="px-5 py-4 border-t border-ink-100 dark:border-ink-700 flex justify-end gap-2 shrink-0">{footer}</div>}
      </div>
    </div>
  )
}

export default Modal
