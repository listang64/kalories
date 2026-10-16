import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useKeyboardInset } from '../hooks/useKeyboardInset'

interface Props {
  open: boolean
  label: string
  onClose: () => void
  children: ReactNode
}

export function BottomPanel({ open, label, onClose, children }: Props) {
  const inset = useKeyboardInset()

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.div
            className="absolute inset-0 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={label}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 420, damping: 40 }}
            style={{ bottom: inset }}
            className="absolute inset-x-0 rounded-t-sheet border-t border-line bg-surface-2 px-5 pt-2 pb-[calc(var(--safe-bottom)+16px)]"
          >
            <div className="mx-auto h-1.5 w-10 rounded-full bg-white/20" />
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
