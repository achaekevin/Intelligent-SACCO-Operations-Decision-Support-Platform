import { AlertTriangle } from 'lucide-react'
import Modal from './Modal'

const ConfirmDialog = ({ open, onClose, onConfirm, title = 'Are you sure?', description, confirmLabel = 'Confirm', danger = false }) => (
  <Modal open={open} onClose={onClose} title={title} size="sm" footer={
    <>
      <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-ink-600 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-ink-700">
        Cancel
      </button>
      <button
        onClick={() => { onConfirm?.(); onClose?.() }}
        className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${danger ? 'bg-danger hover:bg-danger/90' : 'bg-teal-600 hover:bg-teal-700'}`}
      >
        {confirmLabel}
      </button>
    </>
  }>
    <div className="flex gap-3">
      {danger && (
        <div className="w-10 h-10 rounded-full bg-danger-light flex items-center justify-center shrink-0">
          <AlertTriangle size={18} className="text-danger" />
        </div>
      )}
      <p className="text-sm text-ink-500 dark:text-ink-300">{description}</p>
    </div>
  </Modal>
)

export default ConfirmDialog
