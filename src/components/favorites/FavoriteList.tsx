import { favoriteItem, type Favorite } from '../../lib/favorites'
import { formatInt } from '../../lib/format'
import { mealTotals, type MealItem } from '../../lib/nutrition'
import { HeartIcon } from '../icons/HeartIcon'
import { PlusIcon } from '../icons/PlusIcon'
import { FavoriteRow } from './FavoriteRow'

interface Props {
  favorites: Favorite[]
  loaded: boolean
  selection: Record<string, number>
  onSelection: (selection: Record<string, number>) => void
  onEdit: (favorite: Favorite | null) => void
  onAdd: (items: MealItem[]) => void
}

export function FavoriteList({ favorites, loaded, selection, onSelection, onEdit, onAdd }: Props) {
  const items = favorites.flatMap((favorite) => {
    const grams = selection[favorite.id]
    return grams === undefined ? [] : [favoriteItem(favorite, grams)]
  })
  const kcal = mealTotals(items).kcal

  const toggle = (favorite: Favorite) => {
    const { [favorite.id]: current, ...rest } = selection
    onSelection(current === undefined ? { ...selection, [favorite.id]: favorite.grams } : rest)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {favorites.length > 0 ? (
        <ul className="-mx-5 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-5 pb-2">
          {favorites.map((favorite) => (
            <FavoriteRow
              key={favorite.id}
              favorite={favorite}
              grams={selection[favorite.id] ?? null}
              onToggle={() => toggle(favorite)}
              onGrams={(grams) => onSelection({ ...selection, [favorite.id]: grams })}
              onEdit={() => onEdit(favorite)}
            />
          ))}
        </ul>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          {loaded && (
            <>
              <span className="text-accent">
                <HeartIcon size={40} />
              </span>
              <p className="text-[17px] font-semibold">Aucun favori pour l’instant</p>
              <p className="text-[15px] leading-snug text-text-2">
                Enregistre les aliments que tu manges souvent : ils s’ajoutent en un geste, sans passer par l’IA.
              </p>
            </>
          )}
        </div>
      )}
      <div className="grid shrink-0 grid-cols-[auto_1fr] gap-2.5 pt-3">
        <button
          type="button"
          onClick={() => onEdit(null)}
          className="press flex h-14 items-center justify-center gap-1.5 rounded-full bg-white/8 pr-5 pl-4 text-[15px] font-medium text-accent max-[359px]:w-14 max-[359px]:px-0"
        >
          <PlusIcon size={20} strokeWidth={2} />
          <span className="max-[359px]:sr-only">Nouveau</span>
        </button>
        <button
          type="button"
          disabled={items.length === 0}
          onClick={() => onAdd(items)}
          className="press h-14 rounded-full bg-accent text-[16px] font-semibold whitespace-nowrap text-black shadow-accent disabled:opacity-35 disabled:shadow-none"
        >
          {items.length > 0 ? `Ajouter · ${formatInt(kcal)} kcal` : 'Ajouter au repas'}
        </button>
      </div>
    </div>
  )
}
