import { MACROS } from '../../config/macros'
import { formatInt } from '../../lib/format'
import type { RecipeInput } from '../../lib/recipes'
import { PlusIcon } from '../icons/PlusIcon'

interface Props {
  recipe: RecipeInput
  onFavorite: () => void
  onCalculate: () => void
}

export function NutritionCard({ recipe, onFavorite, onCalculate }: Props) {
  const nutrition = recipe.nutrition
  const portion = recipe.servings && nutrition ? nutrition.grams / recipe.servings : null

  if (!nutrition) {
    return (
      <section className="flex items-center gap-3 rounded-card border border-dashed border-white/15 p-4">
        <p className="min-w-0 flex-1 text-[15px] leading-snug text-text-2">
          Valeurs nutritionnelles pas encore calculées.
        </p>
        <button
          type="button"
          onClick={onCalculate}
          className="press h-10 shrink-0 rounded-full bg-white/8 px-4 text-[15px] font-semibold text-accent"
        >
          Calculer
        </button>
      </section>
    )
  }

  return (
    <section className="rounded-card border border-line bg-surface-2 p-4">
      <p className="leading-none whitespace-nowrap">
        <span className="text-[34px] font-semibold text-accent tabular-nums">{formatInt(nutrition.kcal100)}</span>
        <span className="ml-1.5 text-[15px] text-text-2">kcal / 100 g</span>
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {MACROS.map((macro) => (
          <div key={macro.key} className="rounded-xl bg-black/30 px-2.5 py-2">
            <p className="text-[12px] font-semibold" style={{ color: macro.colorB }}>
              {macro.label}
            </p>
            <p className="text-[16px] font-semibold tabular-nums">
              {formatInt(nutrition[`${macro.key}100`])}
              <span className="ml-0.5 text-[13px] font-normal text-text-2">g</span>
            </p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[14px] text-text-2 tabular-nums">
        {portion ? `Une part ≈ ${formatInt(portion)} g · ` : `Le plat entier ≈ ${formatInt(nutrition.grams)} g · `}
        <span className="text-text">{formatInt(((portion ?? nutrition.grams) * nutrition.kcal100) / 100)} kcal</span>
      </p>
      <button
        type="button"
        onClick={onFavorite}
        className="press mt-3 flex h-10 items-center gap-1.5 rounded-full bg-white/8 px-3.5 text-[14px] font-medium text-accent"
      >
        <PlusIcon size={16} strokeWidth={2} />
        Ajouter à mes favoris repas
      </button>
    </section>
  )
}
