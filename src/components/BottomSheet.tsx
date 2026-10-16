import { useEffect, useRef, type ReactNode } from 'react'
import { AnimatePresence, motion, useDragControls } from 'motion/react'
import { ChevronIcon } from './icons/ChevronIcon'
import { CloseIcon } from './icons/CloseIcon'

interface Props {
  open: boolean
  title: string
  onClose: () => void
  onBack?: () => void
  action?: ReactNode
  children: ReactNode
}

const CLOSE_DISTANCE = 120
const CLOSE_VELOCITY = 600

export function BottomSheet({ open, title, onClose, onBack, action, children }: Props) {
  const controls = useDragControls()
  const panel = useRef<HTMLElement>(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  useEffect(() => {
    if (!open) return
    const frame = requestAnimationFrame(() => panel.current?.focus({ preventScroll: true }))
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && closeRef.current()
    window.addEventListener('keydown', onKey)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-40">
          <motion.div
            className="absolute inset-0 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.section
            ref={panel}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            drag="y"
            dragControls={controls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.7 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > CLOSE_DISTANCE || info.velocity.y > CLOSE_VELOCITY) onClose()
            }}
            className="absolute inset-x-0 top-[calc(var(--safe-top)+12px)] bottom-0 flex flex-col rounded-t-sheet border-t border-line bg-surface outline-none"
          >
            <div onPointerDown={(e) => controls.start(e)} className="touch-none px-5 pt-2 pb-3">
              <div className="mx-auto h-1.5 w-10 rounded-full bg-white/20" />
              <div className="mt-3 flex items-center gap-2">
                {onBack && (
                  <button
                    type="button"
                    aria-label="Retour"
                    onClick={onBack}
                    className="-ml-2 grid size-10 place-items-center rounded-full text-text-2"
                  >
                    <ChevronIcon size={22} direction="left" />
                  </button>
                )}
                <h2 className="flex-1 text-[20px] font-semibold">{title}</h2>
                {action}
                <button
                  type="button"
                  aria-label="Fermer"
                  onClick={onClose}
                  className="grid size-10 place-items-center rounded-full bg-surface-2 text-text-2"
                >
                  <CloseIcon size={20} />
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-[calc(var(--safe-bottom)+20px)]">
              {children}
            </div>
          </motion.section>
        </div>
      )}
    </AnimatePresence>
  )
}
