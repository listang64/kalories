import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useAppStore } from '../store/appStore'

const DURATION = 2600

export function Toast() {
  const message = useAppStore((s) => s.toast)
  const hideToast = useAppStore((s) => s.hideToast)

  useEffect(() => {
    if (!message) return
    const id = setTimeout(hideToast, DURATION)
    return () => clearTimeout(id)
  }, [message, hideToast])

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          key={message}
          role="status"
          initial={{ y: -28, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -28, opacity: 0, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
          className="pointer-events-none fixed inset-x-0 top-[calc(var(--safe-top)+12px)] z-50 mx-auto flex w-fit items-center gap-2.5 rounded-full border border-line bg-surface-2 px-4 py-2.5 text-sm text-text"
        >
          <span className="size-2 rounded-full bg-accent shadow-[0_0_10px_var(--accent)]" />
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
