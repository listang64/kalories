import { useState } from 'react'
import { draftKey, type DraftIngredient } from '../../lib/recipeDraft'
import { RECIPE_LIMITS } from '../../lib/recipes'
import { CloseIcon } from '../icons/CloseIcon'
import { PlusIcon } from '../icons/PlusIcon'

interface Props {
  ingredients: DraftIngredient[]
  onChange: (ingredients: DraftIngredient[]) => void
}

const INPUT =
  'h-11 rounded-xl border border-line bg-black/30 px-3 text-base outline-none placeholder:text-white/25 focus:border-white/20'

export function IngredientsEditor({ ingredients, onChange }: Props) {
  const [added, setAdded] = useState<string | null>(null)

  const edit = (key: string, patch: Partial<DraftIngredient>) =>
    onChange(ingredients.map((ingredient) => (ingredient.key === key ? { ...ingredient, ...patch } : ingredient)))

  const add = (after: number) => {
    if (ingredients.length >= RECIPE_LIMITS.ingredients) return
    const row = { key: draftKey(), name: '', quantity: '' }
    setAdded(row.key)
    onChange([...ingredients.slice(0, after + 1), row, ...ingredients.slice(after + 1)])
  }

  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col gap-2">
        {ingredients.map((ingredient, index) => (
          <li key={ingredient.key} className="flex items-center gap-2">
            <input
              aria-label={`Quantité de l’ingrédient ${index + 1}`}
              value={ingredient.quantity}
              onChange={(e) => edit(ingredient.key, { quantity: e.target.value.slice(0, RECIPE_LIMITS.quantity) })}
              placeholder="200 g"
              autoFocus={ingredient.key === added}
              enterKeyHint="next"
              className={`${INPUT} w-[5.5rem] shrink-0`}
            />
            <input
              aria-label={`Ingrédient ${index + 1}`}
              value={ingredient.name}
              onChange={(e) => edit(ingredient.key, { name: e.target.value.slice(0, RECIPE_LIMITS.ingredient) })}
              onKeyDown={(e) => {
                if (e.key !== 'Enter') return
                e.preventDefault()
                add(index)
              }}
              placeholder="Farine"
              enterKeyHint="next"
              autoCapitalize="sentences"
              className={`${INPUT} min-w-0 flex-1`}
            />
            <button
              type="button"
              aria-label={`Retirer l’ingrédient ${index + 1}`}
              onClick={() => onChange(ingredients.filter((item) => item.key !== ingredient.key))}
              className="grid size-9 shrink-0 place-items-center rounded-full text-text-2 active:bg-white/8"
            >
              <CloseIcon size={18} />
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => add(ingredients.length - 1)}
        className="press flex h-11 items-center justify-center gap-1.5 rounded-full border border-dashed border-white/15 text-[15px] font-medium text-accent"
      >
        <PlusIcon size={18} strokeWidth={2} />
        Ajouter un ingrédient
      </button>
    </div>
  )
}
