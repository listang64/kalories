import type { MealType } from '../../config/meals'
import { formatInt } from '../../lib/format'
import { itemTotals, sumTotals, type DayProgress, type MealItem } from '../../lib/nutrition'
import { AnimatedNumber } from '../AnimatedNumber'
import { MealTypeChip } from './MealTypeChip'

interface Props {
  items: MealItem[]
  type: MealType
  onType: (type: MealType) => void
  progress: DayProgress
}

export function ReviewSummary({ items, type, onType, progress }: Props) {
  const totals = sumTotals(items.map(itemTotals))
  const after = progress.kcal + totals.kcal

  return (
    <div className="shrink-0">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[44px] leading-none font-semibold tracking-[-0.02em] text-accent">
            <AnimatedNumber value={totals.kcal} />
            <span className="ml-1.5 text-[20px] font-medium text-text-2">kcal</span>
          </p>
          <p className="mt-2 text-[15px] text-text-2">
            <span className="whitespace-nowrap">
              G <AnimatedNumber value={totals.carbs} /> g
            </span>{' '}
            ·{' '}
            <span className="whitespace-nowrap">
              L <AnimatedNumber value={totals.fat} /> g
            </span>{' '}
            ·{' '}
            <span className="whitespace-nowrap">
              P <AnimatedNumber value={totals.protein} /> g
            </span>
          </p>
        </div>
        <MealTypeChip value={type} onChange={onType} />
      </div>
      <p className="mt-3 text-[15px] tabular-nums">
        <span className="text-text-2">Après ce repas : </span>
        <span className={after > progress.goal ? 'text-accent' : 'text-text'}>{formatInt(after)}</span>
        <span className="text-text-2"> / {formatInt(progress.goal)} kcal</span>
      </p>
    </div>
  )
}
