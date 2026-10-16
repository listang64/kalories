import { AnimatePresence } from 'motion/react'
import { AddFoodRow } from '../components/review/AddFoodRow'
import { ItemCard } from '../components/review/ItemCard'
import { ReviewSummary, type DayProgress } from '../components/review/ReviewSummary'
import { useAppStore } from '../store/appStore'

export function ReviewScreen({ progress }: { progress: DayProgress }) {
  const items = useAppStore((s) => s.review)
  const type = useAppStore((s) => s.draft.type)
  const setMealType = useAppStore((s) => s.setMealType)
  const updateItem = useAppStore((s) => s.updateItem)
  const removeItem = useAppStore((s) => s.removeItem)
  const showToast = useAppStore((s) => s.showToast)

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
        onClick={() => showToast('L’enregistrement arrive à l’étape 8')}
        className="mt-3 h-14 shrink-0 rounded-full bg-accent text-[17px] font-semibold text-black shadow-accent transition-opacity disabled:opacity-35 disabled:shadow-none"
      >
        Valider le repas
      </button>
    </div>
  )
}
