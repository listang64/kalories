import type { ReactNode } from 'react'
import { formatInt } from '../../lib/format'
import { formatMinutes, type RecipeInput } from '../../lib/recipes'
import { CartIcon } from '../icons/CartIcon'
import { FlameIcon } from '../icons/FlameIcon'

interface CardProps {
  title: ReactNode
  aside?: ReactNode
  accent?: boolean
  children: ReactNode
}

function Card({ title, aside, accent = false, children }: CardProps) {
  return (
    <section className={`rounded-card border p-4 ${accent ? 'border-accent/30 bg-accent/8' : 'border-line bg-surface-2'}`}>
      <div className="flex items-baseline justify-between gap-3">
        <h4 className="label text-accent">{title}</h4>
        {aside && <span className="text-[13px] text-text-2">{aside}</span>}
      </div>
      {children}
    </section>
  )
}

export function IngredientsCard({ recipe, onShopping }: { recipe: RecipeInput; onShopping: () => void }) {
  return (
    <Card title="Ingrédients" aside={recipe.servings ? `pour ${recipe.servings} pers.` : undefined}>
      {recipe.ingredients.length === 0 ? (
        <p className="mt-3 text-[15px] text-text-2">Aucun ingrédient noté.</p>
      ) : (
        <>
          <ul className="mt-2 divide-y divide-white/6">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="flex items-baseline gap-3 py-2 text-[16px]">
                <span className="size-1.5 shrink-0 translate-y-[-3px] rounded-full bg-accent" />
                <span className="min-w-0 flex-1">{ingredient.name}</span>
                {ingredient.quantity && <span className="shrink-0 text-text-2 tabular-nums">{ingredient.quantity}</span>}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={onShopping}
            className="press mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white/8 text-[15px] font-semibold text-accent"
          >
            <CartIcon size={19} />
            Ajouter à la liste de courses
          </button>
        </>
      )}
    </Card>
  )
}

export function StepsCard({ steps }: { steps: string[] }) {
  return (
    <Card title="Préparation" aside={steps.length > 0 ? `${steps.length} étape${steps.length > 1 ? 's' : ''}` : undefined}>
      {steps.length === 0 ? (
        <p className="mt-3 text-[15px] text-text-2">Aucune étape notée.</p>
      ) : (
        <ol className="mt-3 flex flex-col gap-3.5">
          {steps.map((step, index) => (
            <li key={index} className="flex gap-3">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent/15 text-[14px] font-semibold text-accent tabular-nums">
                {index + 1}
              </span>
              <p className="min-w-0 flex-1 pt-0.5 text-[16px] leading-relaxed whitespace-pre-line">{step}</p>
            </li>
          ))}
        </ol>
      )}
    </Card>
  )
}

export function CookingCard({ recipe }: { recipe: RecipeInput }) {
  const rows = [
    recipe.cookTemp ? ['Température', `${formatInt(recipe.cookTemp)} °C`] : null,
    recipe.cookMinutes ? ['Durée', formatMinutes(recipe.cookMinutes)] : null,
    recipe.cookNote ? ['Mode', recipe.cookNote] : null,
  ].filter((row): row is string[] => row !== null)
  if (rows.length === 0) return null

  return (
    <Card
      accent
      title={
        <span className="flex items-center gap-1.5">
          <FlameIcon size={15} />
          Cuisson
        </span>
      }
    >
      <dl className="mt-2 flex flex-col">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-4 py-1.5 text-[16px]">
            <dt className="text-text-2">{label}</dt>
            <dd className="text-right font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  )
}
