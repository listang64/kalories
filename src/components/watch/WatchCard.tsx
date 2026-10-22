import { motion } from 'motion/react'
import type { WatchItem } from '../../lib/watchlist'
import { usePerson } from '../../store/sessionStore'
import { TrashIcon } from '../icons/TrashIcon'
import { SwipeButton } from '../SwipeButton'
import { Poster } from './Poster'

interface Props {
  item: WatchItem
  onOpen: () => void
  onDelete: () => void
}

export function WatchCard({ item, onOpen, onDelete }: Props) {
  const adder = usePerson(item.addedBy)

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ x: -200, opacity: 0, transition: { duration: 0.22 } }}
      transition={{ type: 'spring', stiffness: 480, damping: 34 }}
      className="list-none"
    >
      <SwipeButton
        label={`${item.title}. Toucher pour voir la fiche, glisser à gauche pour supprimer`}
        action={<TrashIcon size={18} />}
        onTap={onOpen}
        onSwipe={onDelete}
        className="w-full rounded-card py-2.5 pr-4 pl-2.5 text-left"
        contentClassName="flex min-w-0 flex-1 items-center gap-3"
      >
        <Poster src={item.poster} className="h-14 w-10 rounded-lg" icon={20} />
        <span className="min-w-0 flex-1">
          <span className="line-clamp-2 text-[17px] leading-snug font-semibold">{item.title}</span>
          <span className="mt-0.5 flex items-center gap-1.5 text-[14px] text-text-2">
            {adder && <span className="size-1.5 shrink-0 rounded-full" style={{ background: adder.chartColor }} />}
            <span className="truncate">{[item.year, adder && `ajouté par ${adder.name}`].filter(Boolean).join(' · ')}</span>
          </span>
        </span>
      </SwipeButton>
    </motion.li>
  )
}
