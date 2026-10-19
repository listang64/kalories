import { formatInt } from '../../lib/format'
import { formatMinutes, type Recipe } from '../../lib/recipes'
import { ChevronIcon } from '../icons/ChevronIcon'
import { ClockIcon } from '../icons/ClockIcon'
import { FavoriteToggle } from './FavoriteToggle'

interface Props {
  recipe: Recipe
  favorite: boolean
  onOpen: () => void
  onFavorite: () => void
}

export function RecipeRow({ recipe, favorite, onOpen, onFavorite }: Props) {
  const kcal = recipe.nutrition?.kcal100

  return (
    <li className="flex items-center rounded-card border border-line bg-surface-2">
      <FavoriteToggle name={recipe.name} favorite={favorite} onToggle={onFavorite} size={20} />
      <button type="button" onClick={onOpen} className="press flex min-w-0 flex-1 items-center gap-3 py-3 pr-2 text-left">
        <span className="min-w-0 flex-1">
          <span className="line-clamp-2 text-[17px] leading-snug font-semibold">{recipe.name}</span>
          <span className="mt-0.5 flex items-center gap-1.5 text-[14px] text-text-2">
            <ClockIcon size={14} />
            {recipe.prepMinutes ? formatMinutes(recipe.prepMinutes) : '—'}
          </span>
        </span>
        <span className="shrink-0 text-right tabular-nums">
          <span className={`block text-[19px] leading-tight font-semibold ${kcal === undefined ? 'text-text-2' : 'text-accent'}`}>
            {kcal === undefined ? '—' : formatInt(kcal)}
          </span>
          <span className="block text-[12px] text-text-2">kcal / 100 g</span>
        </span>
        <span className="shrink-0 text-text-2">
          <ChevronIcon size={18} />
        </span>
      </button>
    </li>
  )
}
