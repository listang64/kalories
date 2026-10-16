import { motion } from 'motion/react'
import { MEAL_TYPES, type MealType } from '../config/meals'
import { MealIcon } from './icons/MealIcon'

interface Props {
  selected: MealType
  onChoose: (type: MealType) => void
}

export function MealTypeButtons({ selected, onChoose }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {MEAL_TYPES.map(({ value, label }) => {
        const active = value === selected
        return (
          <motion.button
            key={value}
            type="button"
            onClick={() => onChoose(value)}
            whileTap={{ scale: 0.96 }}
            aria-pressed={active}
            className={`flex aspect-[1.2] flex-col items-center justify-center gap-3 rounded-card border bg-surface-2 text-[17px] font-medium ${
              active ? 'border-accent shadow-[0_0_24px_rgba(255,122,26,0.22)]' : 'border-line'
            }`}
          >
            <span className={active ? 'text-accent' : 'text-text-2'}>
              <MealIcon type={value} size={32} />
            </span>
            {label}
          </motion.button>
        )
      })}
    </div>
  )
}
