import { AnimatePresence } from 'motion/react'
import { AddFoodRow } from '../components/review/AddFoodRow'
import { ItemCard } from '../components/review/ItemCard'
import { ReviewSummary } from '../components/review/ReviewSummary'
import type { DayProgress } from '../lib/nutrition'
import { todayKey } from '../lib/dates'
import { saveMeal, updateMeal } from '../lib/meals'
import { useAppStore } from '../store/appStore'

interface Props {
  uid: string
  progress: DayProgress
}

export function ReviewScreen({ uid, progress }: Props) {
  const items = useAppStore((s) => s.review)
  const type = useAppStore((s) => s.draft.type)
  const setMealType = useAppStore((s) => s.setMealType)
  const updateItem = useAppStore((s) => s.updateItem)
  const removeItem = useAppStore((s) => s.removeItem)
  const showToast = useAppStore((s) => s.showToast)
  const setOverlay = useAppStore((s) => s.setOverlay)
  const closeEdit = useAppStore((s) => s.closeEdit)
  const editing = useAppStore((s) => s.editing !== null)

  const validate = () => {
    const { draft, review, editing: target, addTarget } = useAppStore.getState()
    const fail = () => showToast('Enregistrement impossible')
    if (target) {
      updateMeal(target.meal, { type: draft.type, items: review }).catch(fail)
      return closeEdit()
    }
    const meal = { type: draft.type, note: draft.note, items: review }
    saveMeal(uid, meal, addTarget?.date ?? todayKey()).catch(fail)
    setOverlay(null)
  }

  return (
    <div className="flex h-full flex-col">
      <ReviewSummary items={items} type={type} onType={setMealType} progress={progress} />
      <div className="-mx-5 mt-4 min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-5 pb-2">
        <div className="flex flex-col gap-2.5">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onChange={(patch) => updateItem(item.id, patch)}
                onRemove={() => removeItem(item.id)}
              />
            ))}
          </AnimatePresence>
          <AddFoodRow />
        </div>
      </div>
      <button
        type="button"
        disabled={items.length === 0}
        onClick={validate}
        className="press mt-3 h-14 shrink-0 rounded-full bg-accent text-[17px] font-semibold text-black shadow-accent disabled:opacity-35 disabled:shadow-none"
      >
        {editing ? 'Enregistrer' : 'Valider le repas'}
      </button>
    </div>
  )
}
