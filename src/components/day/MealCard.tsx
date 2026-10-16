import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { formatTime } from '../../lib/dates'
import { formatInt } from '../../lib/format'
import type { Meal } from '../../lib/meals'
import { itemTotals, mealTotals } from '../../lib/nutrition'
import { DotsIcon } from '../icons/DotsIcon'

interface Props {
  meal: Meal
  onActions: () => void
}

export function MealCard({ meal, onActions }: Props) {
  const [open, setOpen] = useState(false)
  const names = meal.items.map((item) => item.name).join(', ') || 'Repas vide'

  return (
    <motion.div layout className="overflow-hidden rounded-card border border-line bg-surface-2">
      <div className="flex items-center gap-1 py-1 pr-1 pl-4">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="flex min-h-12 min-w-0 flex-1 items-center gap-3 text-left"
        >
          <span className="w-11 shrink-0 text-[13px] text-text-2 tabular-nums">{formatTime(meal.createdAt)}</span>
          <span className="min-w-0 flex-1 truncate text-[15px]">{names}</span>
          <span className="shrink-0 text-[15px] font-semibold tabular-nums">
            {formatInt(mealTotals(meal.items).kcal)}
            <span className="ml-1 text-[13px] font-normal text-text-2">kcal</span>
          </span>
        </button>
        <button
          type="button"
          aria-label="Actions du repas"
          onClick={onActions}
          className="grid size-10 shrink-0 place-items-center rounded-full text-text-2"
        >
          <DotsIcon />
        </button>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 38 }}
            className="border-t border-line px-4"
          >
            {meal.items.map((item, i) => (
              <li key={`${item.name}-${i}`} className="flex items-center gap-3 py-2.5 text-[15px] tabular-nums">
                <span className="min-w-0 flex-1 truncate">{item.name}</span>
                <span className="text-text-2">{formatInt(item.grams)} g</span>
                <span className="w-16 text-right">{formatInt(itemTotals(item).kcal)} kcal</span>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
