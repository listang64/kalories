import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { MEAL_TYPES, mealLabel, type MealType } from '../../config/meals'
import { MealIcon } from '../icons/MealIcon'

interface Props {
  value: MealType
  onChange: (type: MealType) => void
}

export function MealTypeChip({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        aria-expanded={open}
        aria-label={`Type de repas : ${mealLabel(value)}`}
        onClick={() => setOpen(!open)}
        className="flex h-9 items-center gap-2 rounded-full border border-line bg-surface-2 pr-3.5 pl-3 text-[15px]"
      >
        <span className="text-accent">
          <MealIcon type={value} size={18} />
        </span>
        {mealLabel(value)}
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -6 }}
              transition={{ type: 'spring', stiffness: 520, damping: 34 }}
              className="absolute top-11 right-0 z-20 w-44 origin-top-right overflow-hidden rounded-card border border-line bg-surface-2 py-1"
            >
              {MEAL_TYPES.map((meal) => (
                <button
                  key={meal.value}
                  type="button"
                  onClick={() => {
                    onChange(meal.value)
                    setOpen(false)
                  }}
                  className={`flex h-11 w-full items-center gap-3 px-4 text-left text-[15px] ${
                    meal.value === value ? 'text-accent' : 'text-text'
                  }`}
                >
                  <MealIcon type={meal.value} size={18} />
                  {meal.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
