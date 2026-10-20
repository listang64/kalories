import { AnimatePresence } from 'motion/react'
import { ItemCard } from '../components/review/ItemCard'
import { ReviewSummary } from '../components/review/ReviewSummary'
import { mealLabel } from '../config/meals'
import { useFavorites } from '../hooks/useFavorites'
import { dayPhrase, todayKey } from '../lib/dates'
import { deleteFavorite, newFavoriteId, saveFavorite } from '../lib/favorites'
import { formatInt } from '../lib/format'
import { saveMeal, updateMeal } from '../lib/meals'
import { mealTotals, type DayProgress } from '../lib/nutrition'
import { useAppStore, type ReviewItem } from '../store/appStore'

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
  const { favorites } = useFavorites(uid)
  const favoriteOf = (item: ReviewItem) =>
    favorites.find((favorite) => favorite.name.localeCompare(item.name.trim(), 'fr', { sensitivity: 'base' }) === 0)

  const toggleFavorite = (item: ReviewItem) => {
    const match = favoriteOf(item)
    const fail = () => showToast('Favoris : enregistrement impossible')
    if (match) deleteFavorite(uid, match.id).catch(fail)
    else saveFavorite(uid, newFavoriteId(uid), item).catch(fail)
    showToast(match ? `${match.name} retiré des favoris` : `${item.name.trim()} ajouté aux favoris`)
  }

  const validate = () => {
    const { draft, review, editing: target, addTarget } = useAppStore.getState()
    const fail = () => showToast('Enregistrement impossible')
    if (target) {
      updateMeal(target.meal, { type: draft.type, items: review }).catch(fail)
      return closeEdit()
    }
    const meal = { type: draft.type, note: draft.note, items: review }
    const today = todayKey()
    const date = addTarget?.date ?? today
    saveMeal(uid, meal, date).catch(fail)
    const when = date === today ? '' : ` pour ${dayPhrase(date, today)}`
    showToast(`${mealLabel(draft.type)} enregistré${when} · ${formatInt(mealTotals(review).kcal)} kcal`)
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
                favorite={favoriteOf(item) !== undefined}
                onChange={(patch) => updateItem(item.id, patch)}
                onFavorite={() => toggleFavorite(item)}
                onRemove={() => removeItem(item.id)}
              />
            ))}
          </AnimatePresence>
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
