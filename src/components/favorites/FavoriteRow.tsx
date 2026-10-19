import { AnimatePresence, motion } from 'motion/react'
import type { Favorite } from '../../lib/favorites'
import { formatInt } from '../../lib/format'
import { itemTotals } from '../../lib/nutrition'
import { CheckIcon } from '../icons/CheckIcon'
import { PencilIcon } from '../icons/PencilIcon'
import { Stepper } from '../Stepper'

interface Props {
  favorite: Favorite
  grams: number | null
  onToggle: () => void
  onGrams: (grams: number) => void
  onEdit: () => void
}

export function FavoriteRow({ favorite, grams, onToggle, onGrams, onEdit }: Props) {
  const selected = grams !== null
  const shown = grams ?? favorite.grams
  const kcal = itemTotals({ ...favorite, grams: shown, confidence: 'haute' }).kcal

  return (
    <li
      className={`overflow-hidden rounded-card border transition-colors ${selected ? 'border-accent/60 bg-accent/8' : 'border-line bg-surface-2'}`}
    >
      <div className="flex items-center">
        <button
          type="button"
          aria-pressed={selected}
          onClick={onToggle}
          className="flex min-w-0 flex-1 items-center gap-3 py-3 pl-4 text-left"
        >
          <span
            className={`grid size-6 shrink-0 place-items-center rounded-full border transition-colors ${selected ? 'border-accent bg-accent text-black' : 'border-white/25'}`}
          >
            {selected && <CheckIcon size={15} strokeWidth={2.5} />}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[16px] font-semibold">{favorite.name}</span>
            <span className="block text-[13px] text-text-2 tabular-nums">
              {formatInt(shown)} g · <span className={selected ? 'text-accent' : ''}>{formatInt(kcal)} kcal</span>
            </span>
          </span>
        </button>
        <button
          type="button"
          aria-label={`Modifier ${favorite.name}`}
          onClick={onEdit}
          className="grid size-12 shrink-0 place-items-center text-text-2 active:text-text"
        >
          <PencilIcon size={19} />
        </button>
      </div>
      <AnimatePresence initial={false}>
        {selected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between border-t border-white/8 py-2 pr-2 pl-4">
              <span className="text-[15px] text-text-2">Quantité</span>
              <Stepper label={`Quantité de ${favorite.name}`} value={shown} onChange={onGrams} step={5} min={1} max={5000} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  )
}
