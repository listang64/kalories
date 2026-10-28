import type { ReactNode } from 'react'
import { formatInt } from '../../lib/format'
import { formatMinutes, groupItems, RECIPE_LIMITS, type Ingredient, type RecipeInput, type Step } from '../../lib/recipes'
import { scaleQuantity } from '../../lib/recipeScale'
import { mergeEntries, type ShoppingEntry } from '../../lib/shopping'
import { CartIcon } from '../icons/CartIcon'
import { ChevronIcon } from '../icons/ChevronIcon'
import { FlameIcon } from '../icons/FlameIcon'
import { NumberField } from '../NumberField'

interface CardProps {
  title: ReactNode
  aside?: ReactNode
  accent?: boolean
  children: ReactNode
}

function Card({ title, aside, accent = false, children }: CardProps) {
  return (
    <section className={`rounded-card border p-4 ${accent ? 'border-accent/30 bg-accent/8' : 'border-line bg-surface-2'}`}>
      <div className="flex min-h-8 items-center justify-between gap-3">
        <h4 className="label text-accent">{title}</h4>
        {aside && <span className="text-[13px] text-text-2">{aside}</span>}
      </div>
      {children}
    </section>
  )
}

const STEP_BUTTON = 'grid size-8 place-items-center rounded-full bg-white/8 text-text active:bg-white/16 disabled:opacity-30'

function ServingsControl({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <span className="flex items-center gap-1.5 text-text">
      <button
        type="button"
        aria-label="Une personne de moins"
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
        className={STEP_BUTTON}
      >
        <ChevronIcon size={18} direction="left" />
      </button>
      <NumberField
        label="Nombre de personnes"
        value={value}
        suffix="pers."
        min={1}
        max={RECIPE_LIMITS.servings}
        onCommit={onChange}
        inputClassName="w-11 rounded-lg bg-white/8 py-1 text-center text-[16px]"
      />
      <button
        type="button"
        aria-label="Une personne de plus"
        disabled={value >= RECIPE_LIMITS.servings}
        onClick={() => onChange(value + 1)}
        className={STEP_BUTTON}
      >
        <ChevronIcon size={18} />
      </button>
    </span>
  )
}

interface IngredientsProps {
  recipe: RecipeInput
  servings: number | null
  onServings: (servings: number) => void
  onShopping: (entries: ShoppingEntry[]) => void
}

export function IngredientsCard({ recipe, servings, onServings, onShopping }: IngredientsProps) {
  const factor = servings && recipe.servings ? servings / recipe.servings : 1
  const ingredients = recipe.ingredients.map((ingredient) => ({
    ...ingredient,
    quantity: scaleQuantity(ingredient.quantity, factor),
  }))

  return (
    <Card
      title="Ingrédients"
      aside={servings && recipe.servings ? <ServingsControl value={servings} onChange={onServings} /> : undefined}
    >
      {ingredients.length === 0 ? (
        <p className="mt-3 text-[15px] text-text-2">Aucun ingrédient noté.</p>
      ) : (
        <>
          {factor !== 1 && recipe.servings && (
            <p className="mt-2 flex items-center justify-between gap-3 text-[13px] text-text-2">
              <span>Quantités recalculées (recette pour {recipe.servings})</span>
              <button type="button" onClick={() => onServings(recipe.servings ?? 1)} className="shrink-0 font-medium text-accent">
                Rétablir
              </button>
            </p>
          )}
          {groupItems(ingredients).map((group, index) => (
            <div key={index} className={group.title ? undefined : 'pt-1'}>
              <GroupTitle title={group.title} />
              <IngredientList ingredients={group.items} scaled={factor !== 1} />
            </div>
          ))}
          <button
            type="button"
            onClick={() => onShopping(mergeEntries(ingredients))}
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

function GroupTitle({ title }: { title: string }) {
  return title ? <h5 className="mt-4 text-[16px] font-semibold">{title}</h5> : null
}

function IngredientList({ ingredients, scaled }: { ingredients: Ingredient[]; scaled: boolean }) {
  return (
    <ul className="mt-1 divide-y divide-white/6">
      {ingredients.map((ingredient, index) => (
        <li key={index} className="flex items-baseline gap-3 py-2 text-[16px]">
          <span className="size-1.5 shrink-0 translate-y-[-3px] rounded-full bg-accent" />
          <span className="min-w-0 flex-1">{ingredient.name}</span>
          {ingredient.quantity && (
            <span className={`shrink-0 tabular-nums ${scaled ? 'font-semibold text-text' : 'text-text-2'}`}>
              {ingredient.quantity}
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}

export function StepsCard({ steps }: { steps: Step[] }) {
  const groups = groupItems(steps)
  const starts = groups.map((_, index) => groups.slice(0, index).reduce((total, group) => total + group.items.length, 0))

  return (
    <Card title="Préparation" aside={steps.length > 0 ? `${steps.length} étape${steps.length > 1 ? 's' : ''}` : undefined}>
      {steps.length === 0 ? (
        <p className="mt-3 text-[15px] text-text-2">Aucune étape notée.</p>
      ) : (
        groups.map((group, index) => (
          <div key={index}>
            <GroupTitle title={group.title} />
            <ol className="mt-3 flex flex-col gap-3.5">
              {group.items.map((step, position) => (
                <li key={position} className="flex gap-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent/15 text-[14px] font-semibold text-accent tabular-nums">
                    {(starts[index] ?? 0) + position + 1}
                  </span>
                  <p className="min-w-0 flex-1 pt-0.5 text-[16px] leading-relaxed whitespace-pre-line">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        ))
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
