import { AnimatePresence, motion } from 'motion/react'
import { useOnline } from '../../hooks/useOnline'
import { formatLongDate } from '../../lib/dates'
import { GearIcon } from '../icons/GearIcon'

interface Props {
  dateKey: string
  onSettings: () => void
}

export function HomeHeader({ dateKey, onSettings }: Props) {
  const online = useOnline()

  return (
    <header className="flex items-start justify-between pt-3">
      <div>
        <h1 className="text-[28px] leading-tight font-semibold tracking-[-0.02em]">Aujourd’hui</h1>
        <p className="text-[15px] text-text-2">{formatLongDate(dateKey)}</p>
      </div>
      <div className="flex items-center gap-1">
        <AnimatePresence>
          {!online && (
            <motion.span
              role="status"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex h-7 items-center gap-1.5 rounded-full border border-line bg-surface-2 px-2.5 text-[12px] text-text-2"
            >
              <span className="size-1.5 rounded-full bg-text-2" />
              Hors ligne
            </motion.span>
          )}
        </AnimatePresence>
        <button
          type="button"
          aria-label="Paramètres"
          onClick={onSettings}
          className="-mr-2 grid size-11 place-items-center rounded-full text-text-2 transition-colors active:bg-white/8"
        >
          <GearIcon />
        </button>
      </div>
    </header>
  )
}
