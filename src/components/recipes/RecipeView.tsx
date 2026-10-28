import { useState } from 'react'
import { categoryLabel } from '../../config/recipes'
import { formatMinutes, type Recipe } from '../../lib/recipes'
import type { ShoppingEntry } from '../../lib/shopping'
import { usePerson } from '../../store/sessionStore'
import { ClockIcon } from '../icons/ClockIcon'
import { FlameIcon } from '../icons/FlameIcon'
import { FavoriteToggle } from './FavoriteToggle'
import { NutritionCard } from './NutritionCard'
import { CookingCard, IngredientsCard, StepsCard } from './RecipeCards'

interface Props {
  recipe: Recipe
  uid: string
  favorite: boolean
  onFavorite: () => void
  onEdit: () => void
  onShopping: (entries: ShoppingEntry[]) => void
  onAddToDay: () => void
}

const CHIP = 'flex h-8 items-center gap-1.5 rounded-full bg-white/8 px-3 text-[14px]'

export function RecipeView({ recipe, uid, favorite, onFavorite, onEdit, onShopping, onAddToDay }: Props) {
  const author = usePerson(recipe.createdBy)
  const [servings, setServings] = useState(recipe.servings)
  const [portion, setPortion] = useState<number | null>(null)

  return (
    <article className="flex flex-col gap-4 pb-4">
      <header>
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <p className="label text-accent">{categoryLabel(recipe.category)}</p>
            <h3 className="mt-1 text-[26px] leading-tight font-semibold tracking-[-0.01em]">{recipe.name}</h3>
          </div>
          <span className="-mt-1 -mr-2">
            <FavoriteToggle name={recipe.name} favorite={favorite} onToggle={onFavorite} size={26} />
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 tabular-nums">
          {recipe.prepMinutes && (
            <span className={CHIP}>
              <ClockIcon size={15} />
              {formatMinutes(recipe.prepMinutes)}
            </span>
          )}
          {recipe.cookMinutes && (
            <span className={CHIP}>
              <FlameIcon size={15} />
              {formatMinutes(recipe.cookMinutes)}
            </span>
          )}
        </div>
        {author && (
          <p className="mt-2.5 flex items-center gap-1.5 text-[13px] text-text-2">
            <span className="size-1.5 rounded-full" style={{ background: author.chartColor }} />
            Ajoutée par {author.uid === uid ? 'toi' : author.name}
          </p>
        )}
      </header>
      <NutritionCard recipe={recipe} onCalculate={onEdit} onAddToDay={onAddToDay} />
      <IngredientsCard
        recipe={recipe}
        servings={servings}
        portion={portion}
        onServings={setServings}
        onPortion={setPortion}
        onShopping={onShopping}
      />
      <StepsCard steps={recipe.steps} />
      <CookingCard recipe={recipe} />
    </article>
  )
}
