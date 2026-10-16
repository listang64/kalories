import { AnimatePresence, motion } from 'motion/react'
import { useOnline } from '../../hooks/useOnline'
import { formatLongDate } from '../../lib/dates'
import { GearIcon } from '../icons/GearIcon'
import { HandshakeIcon } from '../icons/HandshakeIcon'
import { WeatherBadge } from './WeatherBadge'

interface Props {
  dateKey: string
  onLoans: () => void
  onSettings: () => void
}

export function HomeHeader({ dateKey, onLoans, onSettings }: Props) {
  const online = useOnline()

  return (
    <header className="pt-3">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-[clamp(19px,5.9vw,28px)] leading-tight font-semibold tracking-[-0.02em] text-accent underline decoration-accent/50 decoration-2 underline-offset-[6px]">
          {formatLongDate(dateKey)}
        </h1>
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
            aria-label="Prêts"
            onClick={onLoans}
            className="grid size-11 place-items-center rounded-full text-text-2 transition-colors active:bg-white/8"
          >
            <HandshakeIcon />
          </button>
          <button
            type="button"
            aria-label="Paramètres"
            onClick={onSettings}
            className="-mr-2 grid size-11 place-items-center rounded-full text-text-2 transition-colors active:bg-white/8"
          >
            <GearIcon />
          </button>
        </div>
      </div>
      <WeatherBadge dateKey={dateKey} />
    </header>
  )
}
