import { motion, useMotionValue, useTransform } from 'motion/react'
import { itemTotals, type MealItem } from '../../lib/nutrition'
import type { ReviewItem } from '../../store/appStore'
import { AnimatedNumber } from '../AnimatedNumber'
import { TrashIcon } from '../icons/TrashIcon'
import { Stepper } from '../Stepper'

interface Props {
  item: ReviewItem
  onChange: (patch: Partial<MealItem>) => void
  onRemove: () => void
}

const SWIPE_DISTANCE = 96

export function ItemCard({ item, onChange, onRemove }: Props) {
  const x = useMotionValue(0)
  const reveal = useTransform(x, [-SWIPE_DISTANCE, -24], [1, 0])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -80, transition: { duration: 0.2 } }}
      className="relative"
    >
      <motion.div
        aria-hidden="true"
        style={{ opacity: reveal }}
        className="absolute inset-0 flex items-center justify-end rounded-card bg-accent pr-6 text-black"
      >
        <TrashIcon />
      </motion.div>
      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0.9, right: 0 }}
        style={{ x }}
        onDragEnd={(_, info) => {
          if (info.offset.x < -SWIPE_DISTANCE || info.velocity.x < -800) onRemove()
        }}
        className="relative rounded-card border border-line bg-surface-2 px-4 pt-3.5 pb-3"
      >
        <div className="flex items-center gap-2">
          {item.confidence === 'basse' && (
            <span role="img" aria-label="Poids à vérifier" className="size-2 shrink-0 rounded-full bg-text-2" />
          )}
          <input
            aria-label="Nom de l’aliment"
            value={item.name}
            onChange={(e) => onChange({ name: e.target.value })}
            onBlur={() => !item.name.trim() && onChange({ name: 'Aliment' })}
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            enterKeyHint="done"
            className="min-w-0 flex-1 bg-transparent text-[17px] font-semibold outline-none"
          />
          <span className="shrink-0 text-[17px] font-semibold">
            <AnimatedNumber value={itemTotals(item).kcal} />
            <span className="ml-1 text-[13px] font-normal text-text-2">kcal</span>
          </span>
        </div>
        <div className="mt-2.5 flex items-center justify-between">
          <Stepper label={`Poids de ${item.name}`} value={item.grams} onChange={(grams) => onChange({ grams })} />
          <button
            type="button"
            aria-label={`Supprimer ${item.name}`}
            onClick={onRemove}
            className="grid size-10 place-items-center rounded-full text-text-2"
          >
            <TrashIcon size={20} />
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
