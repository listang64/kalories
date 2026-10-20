import { useState, type KeyboardEvent } from 'react'
import {
  emptyGroup,
  emptyIngredient,
  type DraftGroup,
  type DraftIngredient,
  type DraftIngredientRow,
} from '../../lib/recipeDraft'
import { RECIPE_LIMITS } from '../../lib/recipes'
import { ChevronIcon } from '../icons/ChevronIcon'
import { CloseIcon } from '../icons/CloseIcon'
import { PlusIcon } from '../icons/PlusIcon'

interface Props {
  ingredients: DraftIngredientRow[]
  onChange: (ingredients: DraftIngredientRow[]) => void
}

const INPUT =
  'h-11 rounded-xl border border-line bg-black/30 px-3 text-base outline-none placeholder:text-white/25 focus:border-white/20'
const ICON_BUTTON =
  'grid size-9 shrink-0 place-items-center rounded-full text-text-2 active:bg-white/8 disabled:opacity-30'
const ADD_BUTTON =
  'press flex h-11 items-center justify-center gap-1.5 rounded-full border border-dashed border-white/15 text-[15px] font-medium text-accent disabled:opacity-40'

export function IngredientsEditor({ ingredients, onChange }: Props) {
  const [added, setAdded] = useState<string | null>(null)
  const items = ingredients.filter((row) => row.kind === 'ingredient').length
  const groups = ingredients.length - items
  const ordinal = (index: number, kind: DraftIngredientRow['kind']) =>
    ingredients.slice(0, index + 1).filter((row) => row.kind === kind).length

  const replace = (next: DraftIngredientRow) => onChange(ingredients.map((row) => (row.key === next.key ? next : row)))
  const remove = (key: string) => onChange(ingredients.filter((row) => row.key !== key))
  const insert = (index: number, rows: DraftIngredientRow[]) => {
    setAdded(rows[0]?.key ?? null)
    onChange([...ingredients.slice(0, index), ...rows, ...ingredients.slice(index)])
  }
  const addIngredient = (index: number) => {
    if (items < RECIPE_LIMITS.ingredients) insert(index, [emptyIngredient()])
  }
  const addGroup = () => {
    const last = ingredients.at(-1)
    const blank = last?.kind === 'ingredient' && !last.name.trim() && !last.quantity.trim()
    const room = items < RECIPE_LIMITS.ingredients
    insert(blank ? ingredients.length - 1 : ingredients.length, [emptyGroup(), ...(blank || !room ? [] : [emptyIngredient()])])
  }
  const move = (row: DraftGroup, index: number, offset: number) => {
    const next = ingredients.filter((item) => item.key !== row.key)
    next.splice(index + offset, 0, row)
    onChange(next)
  }

  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col gap-2">
        {ingredients.map((row, index) =>
          row.kind === 'group' ? (
            <GroupRow
              key={row.key}
              row={row}
              number={ordinal(index, 'group')}
              focus={row.key === added}
              first={index === 0}
              last={index === ingredients.length - 1}
              onChange={replace}
              onMove={(offset) => move(row, index, offset)}
              onRemove={() => remove(row.key)}
              onNext={() => addIngredient(index + 1)}
            />
          ) : (
            <IngredientRow
              key={row.key}
              row={row}
              number={ordinal(index, 'ingredient')}
              focus={row.key === added}
              onChange={replace}
              onRemove={() => remove(row.key)}
              onNext={() => addIngredient(index + 1)}
            />
          ),
        )}
      </ul>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          aria-label="Ajouter un ingrédient"
          disabled={items >= RECIPE_LIMITS.ingredients}
          onClick={() => addIngredient(ingredients.length)}
          className={ADD_BUTTON}
        >
          <PlusIcon size={18} strokeWidth={2} />
          Ingrédient
        </button>
        <button
          type="button"
          aria-label="Ajouter un groupe d’ingrédients"
          disabled={groups >= RECIPE_LIMITS.groups}
          onClick={addGroup}
          className={ADD_BUTTON}
        >
          <PlusIcon size={18} strokeWidth={2} />
          Groupe
        </button>
      </div>
    </div>
  )
}

interface RowProps<Row> {
  row: Row
  number: number
  focus: boolean
  onChange: (row: Row) => void
  onRemove: () => void
  onNext: () => void
}

const onEnter = (action: (input: HTMLInputElement) => void) => (event: KeyboardEvent<HTMLInputElement>) => {
  if (event.key !== 'Enter') return
  event.preventDefault()
  action(event.currentTarget)
}

function IngredientRow({ row, number, focus, onChange, onRemove, onNext }: RowProps<DraftIngredient>) {
  return (
    <li className="flex items-center gap-2">
      <input
        aria-label={`Quantité de l’ingrédient ${number}`}
        value={row.quantity}
        onChange={(e) => onChange({ ...row, quantity: e.target.value.slice(0, RECIPE_LIMITS.quantity) })}
        placeholder="200 g"
        autoFocus={focus}
        enterKeyHint="next"
        className={`${INPUT} w-[5.5rem] shrink-0`}
      />
      <input
        aria-label={`Ingrédient ${number}`}
        value={row.name}
        onChange={(e) => onChange({ ...row, name: e.target.value.slice(0, RECIPE_LIMITS.ingredient) })}
        onKeyDown={onEnter(onNext)}
        placeholder="Farine"
        enterKeyHint="next"
        autoCapitalize="sentences"
        className={`${INPUT} min-w-0 flex-1`}
      />
      <button type="button" aria-label={`Retirer l’ingrédient ${number}`} onClick={onRemove} className={ICON_BUTTON}>
        <CloseIcon size={18} />
      </button>
    </li>
  )
}

interface GroupProps extends RowProps<DraftGroup> {
  first: boolean
  last: boolean
  onMove: (offset: number) => void
}

function GroupRow({ row, number, focus, first, last, onChange, onMove, onRemove, onNext }: GroupProps) {
  return (
    <li className="mt-2 flex items-center gap-0.5 first:mt-0">
      <input
        aria-label={`Nom du groupe ${number}`}
        value={row.name}
        onChange={(e) => onChange({ ...row, name: e.target.value.slice(0, RECIPE_LIMITS.group) })}
        onKeyDown={onEnter((input) => {
          const next = input.closest('li')?.nextElementSibling?.querySelector('input')
          if (next) next.focus()
          else onNext()
        })}
        placeholder="ex. Pâte, Crème…"
        autoFocus={focus}
        enterKeyHint="next"
        autoCapitalize="sentences"
        className="mr-1.5 h-11 min-w-0 flex-1 rounded-xl border border-accent/30 bg-accent/8 px-3 text-base font-semibold text-accent outline-none placeholder:font-normal placeholder:text-accent/45 focus:border-accent/60"
      />
      <button
        type="button"
        aria-label={`Monter le groupe ${number}`}
        disabled={first}
        onClick={() => onMove(-1)}
        className={ICON_BUTTON}
      >
        <ChevronIcon size={18} direction="up" />
      </button>
      <button
        type="button"
        aria-label={`Descendre le groupe ${number}`}
        disabled={last}
        onClick={() => onMove(1)}
        className={ICON_BUTTON}
      >
        <ChevronIcon size={18} direction="down" />
      </button>
      <button type="button" aria-label={`Retirer le groupe ${number}`} onClick={onRemove} className={ICON_BUTTON}>
        <CloseIcon size={18} />
      </button>
    </li>
  )
}
