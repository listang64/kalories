import { motion } from 'motion/react'
import type { WatchItem } from '../../lib/watchlist'
import { usePerson } from '../../store/sessionStore'
import { CheckIcon } from '../icons/CheckIcon'
import { FilmIcon } from '../icons/FilmIcon'

interface Props {
  item: WatchItem
  onSeen: () => void
}

export function WatchCard({ item, onSeen }: Props) {
  const adder = usePerson(item.addedBy)

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ x: -200, opacity: 0, transition: { duration: 0.22 } }}
      transition={{ type: 'spring', stiffness: 480, damping: 34 }}
      className="flex list-none items-center gap-3 rounded-card border border-line bg-surface-2 py-2.5 pr-2 pl-2.5"
    >
      <span className="grid h-14 w-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-white/6 text-text-2">
        {item.poster ? <img src={item.poster} alt="" className="size-full object-cover" /> : <FilmIcon size={20} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="line-clamp-2 text-[17px] leading-snug font-semibold">{item.title}</span>
        <span className="mt-0.5 flex items-center gap-1.5 text-[14px] text-text-2">
          {adder && <span className="size-1.5 shrink-0 rounded-full" style={{ background: adder.chartColor }} />}
          <span className="truncate">
            {[item.year, adder && `ajouté par ${adder.name}`].filter(Boolean).join(' · ')}
          </span>
        </span>
      </span>
      <button
        type="button"
        aria-label={`J’ai vu ${item.title}`}
        onClick={onSeen}
        className="press grid size-11 shrink-0 place-items-center rounded-full bg-white/8 text-text-2 active:text-accent"
      >
        <CheckIcon size={20} />
      </button>
    </motion.li>
  )
}
