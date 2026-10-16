import { AnimatePresence, motion } from 'motion/react'

interface Props {
  open: boolean
  title: string
  message: string
  confirmLabel: string
  cancelLabel: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ open, title, message, confirmLabel, cancelLabel, onConfirm, onCancel }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center px-8">
          <motion.div
            className="absolute inset-0 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
          />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-label={title}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 34 }}
            className="relative w-full max-w-xs rounded-sheet border border-line bg-surface-2 p-5 text-center"
          >
            <h3 className="text-[17px] font-semibold">{title}</h3>
            <p className="mt-1.5 text-[15px] leading-snug text-text-2">{message}</p>
            <div className="mt-5 grid grid-cols-2 gap-2.5">
              <button type="button" onClick={onCancel} className="h-11 rounded-full bg-white/8 text-[15px] font-medium">
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="h-11 rounded-full bg-accent text-[15px] font-semibold text-black"
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
