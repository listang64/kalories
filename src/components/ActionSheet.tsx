import { AnimatePresence, motion } from 'motion/react'

export interface SheetAction {
  label: string
  onSelect: () => void
  tone?: 'danger'
}

interface Props {
  open: boolean
  title: string
  actions: SheetAction[]
  onClose: () => void
}

export function ActionSheet({ open, title, actions, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end px-3 pb-[calc(var(--safe-bottom)+12px)]">
          <motion.div
            className="absolute inset-0 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="menu"
            aria-label={title}
            initial={{ y: '110%' }}
            animate={{ y: 0 }}
            exit={{ y: '110%' }}
            transition={{ type: 'spring', stiffness: 460, damping: 40 }}
            className="relative flex flex-col gap-2"
          >
            <div className="overflow-hidden rounded-sheet border border-line bg-surface-2">
              <p className="border-b border-line px-4 py-3 text-center text-[13px] text-text-2">{title}</p>
              {actions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onClose()
                    action.onSelect()
                  }}
                  className={`block h-14 w-full border-b border-line text-[17px] last:border-b-0 active:bg-white/6 ${
                    action.tone === 'danger' ? 'text-accent' : 'text-text'
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="h-14 rounded-sheet border border-line bg-surface-2 text-[17px] font-semibold"
            >
              Annuler
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
