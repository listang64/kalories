import { categoryLabel } from '../../config/recipes'
import { newFavoriteId, saveFavorite } from '../../lib/favorites'
import { formatMinutes, portionGrams, type Recipe } from '../../lib/recipes'
import { useAppStore } from '../../store/appStore'
import { usePerson } from '../../store/sessionStore'
import { ClockIcon } from '../icons/ClockIcon'
import { FlameIcon } from '../icons/FlameIcon'
import { UsersIcon } from '../icons/UsersIcon'
import { NutritionCard } from './NutritionCard'
import { CookingCard, IngredientsCard, StepsCard } from './RecipeCards'

interface Props {
  recipe: Recipe
  uid: string
  onEdit: () => void
  onShopping: () => void
}

const CHIP = 'flex h-8 items-center gap-1.5 rounded-full bg-white/8 px-3 text-[14px]'

export function RecipeView({ recipe, uid, onEdit, onShopping }: Props) {
  const author = usePerson(recipe.createdBy)
  const showToast = useAppStore((s) => s.showToast)

  const favorite = () => {
    const { nutrition } = recipe
    if (!nutrition) return
    const { grams: _, ...values } = nutrition
    const input = { name: recipe.name, grams: portionGrams(recipe) ?? 100, ...values }
    saveFavorite(uid, newFavoriteId(uid), input).catch(() => showToast('Enregistrement impossible'))
    showToast('Ajoutée à tes favoris')
  }

  return (
    <article className="flex flex-col gap-4 pb-4">
      <header>
        <p className="label text-accent">{categoryLabel(recipe.category)}</p>
        <h3 className="mt-1 text-[26px] leading-tight font-semibold tracking-[-0.01em]">{recipe.name}</h3>
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
          {recipe.servings && (
            <span className={CHIP}>
              <UsersIcon size={15} />
              {recipe.servings} pers.
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
      <NutritionCard recipe={recipe} onFavorite={favorite} onCalculate={onEdit} />
      <IngredientsCard recipe={recipe} onShopping={onShopping} />
      <StepsCard steps={recipe.steps} />
      <CookingCard recipe={recipe} />
    </article>
  )
}
