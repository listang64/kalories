import { useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useOnline } from '../../hooks/useOnline'
import { formatLongDate } from '../../lib/dates'
import { MenuButton, RadialMenu, type MenuTarget } from './HomeMenu'
import { WeatherBadge } from './WeatherBadge'

interface Props {
  dateKey: string
  onOpen: (target: MenuTarget) => void
}

export function HomeHeader({ dateKey, onOpen }: Props) {
  const online = useOnline()
  const [anchor, setAnchor] = useState<DOMRect | null>(null)
  const close = useCallback(() => setAnchor(null), [])

  return (
    <header className="pt-3">
      <div className="flex items-center gap-1">
        <span aria-hidden="true" className="size-11 shrink-0" />
        <h1 className="flex-1 text-center text-[min(5.9vw,calc((100vw_-_120px)/12))] leading-tight font-semibold tracking-[-0.02em] whitespace-nowrap text-accent underline decoration-accent/50 decoration-2 underline-offset-[6px]">
          {formatLongDate(dateKey)}
        </h1>
        <MenuButton open={anchor !== null} onOpen={setAnchor} />
      </div>
      <RadialMenu
        anchor={anchor}
        onClose={close}
        onSelect={(target) => {
          setAnchor(null)
          onOpen(target)
        }}
      />
      <AnimatePresence>
        {!online && (
          <motion.div
            role="status"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex justify-center overflow-hidden"
          >
            <span className="mt-2 flex h-7 items-center gap-1.5 rounded-full border border-line bg-surface-2 px-2.5 text-[12px] text-text-2">
              <span className="size-1.5 rounded-full bg-text-2" />
              Hors ligne
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      <WeatherBadge dateKey={dateKey} />
    </header>
  )
}
