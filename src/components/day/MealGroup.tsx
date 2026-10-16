import type { MealType } from '../../config/meals'
import { mealLabel } from '../../config/meals'
import { formatInt } from '../../lib/format'
import type { Meal } from '../../lib/meals'
import { mealTotals, sumTotals } from '../../lib/nutrition'
import { MealIcon } from '../icons/MealIcon'
import { PlusIcon } from '../icons/PlusIcon'
import { MealCard } from './MealCard'

interface Props {
  type: MealType
  meals: Meal[]
  onAdd?: () => void
  onActions: (meal: Meal) => void
}

export function MealGroup({ type, meals, onAdd, onActions }: Props) {
  const subtotal = sumTotals(meals.map((meal) => mealTotals(meal.items))).kcal

  return (
    <section>
      <div className="mb-2 flex items-center gap-2 px-1">
        <span className="text-text-2">
          <MealIcon type={type} size={18} />
        </span>
        <h3 className="label flex-1">{mealLabel(type)}</h3>
        <span className="text-[13px] text-text-2 tabular-nums">{formatInt(subtotal)} kcal</span>
        {onAdd && (
          <button
            type="button"
            aria-label={`Ajouter au ${mealLabel(type)}`}
            onClick={onAdd}
            className="-mr-1 grid size-8 place-items-center rounded-full text-accent"
          >
            <PlusIcon size={18} strokeWidth={2} />
          </button>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {meals.map((meal) => (
          <MealCard key={meal.id} meal={meal} onActions={() => onActions(meal)} />
        ))}
      </div>
    </section>
  )
}
