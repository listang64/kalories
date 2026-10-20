import { useState, type KeyboardEvent, type ReactNode } from 'react'
import { emptyGroup, isGroup, type DraftGroup, type DraftItem, type DraftRow } from '../../lib/recipeDraft'
import { RECIPE_LIMITS } from '../../lib/recipes'
import { ChevronIcon } from '../icons/ChevronIcon'
import { CloseIcon } from '../icons/CloseIcon'
import { PlusIcon } from '../icons/PlusIcon'

export interface ItemControls<Item> {
  number: number
  focus: boolean
  onChange: (item: Item) => void
  onRemove: () => void
  onNext: () => void
}

interface Props<Item extends DraftItem> {
  rows: DraftRow<Item>[]
  onChange: (rows: DraftRow<Item>[]) => void
  empty: () => Item
  isBlank: (item: Item) => boolean
  limit: number
  noun: string
  addLabel: string
  groupNoun: string
  renderItem: (item: Item, controls: ItemControls<Item>) => ReactNode
}

export const ICON_BUTTON =
  'grid size-9 shrink-0 place-items-center rounded-full text-text-2 active:bg-white/8 disabled:opacity-30'
const ADD_BUTTON =
  'press flex h-11 items-center justify-center gap-1.5 rounded-full border border-dashed border-white/15 text-[15px] font-medium text-accent disabled:opacity-40'

export function GroupedEditor<Item extends DraftItem>(props: Props<Item>) {
  const { rows, onChange, empty, isBlank, limit, noun, addLabel, groupNoun, renderItem } = props
  const [added, setAdded] = useState<string | null>(null)
  const items = rows.filter((row) => !isGroup(row)).length
  const groups = rows.length - items
  const ordinal = (index: number, group: boolean) =>
    rows.slice(0, index + 1).filter((row) => isGroup(row) === group).length

  const replace = (next: DraftRow<Item>) => onChange(rows.map((row) => (row.key === next.key ? next : row)))
  const remove = (key: string) => onChange(rows.filter((row) => row.key !== key))
  const insert = (index: number, inserted: DraftRow<Item>[]) => {
    setAdded(inserted[0]?.key ?? null)
    onChange([...rows.slice(0, index), ...inserted, ...rows.slice(index)])
  }
  const addItem = (index: number) => {
    if (items < limit) insert(index, [empty()])
  }
  const addGroup = () => {
    const last = rows.at(-1)
    const blank = last !== undefined && !isGroup(last) && isBlank(last)
    insert(blank ? rows.length - 1 : rows.length, [emptyGroup(), ...(blank || items >= limit ? [] : [empty()])])
  }
  const move = (row: DraftGroup, index: number, offset: number) => {
    const next = rows.filter((item) => item.key !== row.key)
    next.splice(index + offset, 0, row)
    onChange(next)
  }

  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col gap-2">
        {rows.map((row, index) =>
          isGroup(row) ? (
            <GroupRow
              key={row.key}
              row={row}
              label={`${groupNoun} ${ordinal(index, true)}`}
              focus={row.key === added}
              first={index === 0}
              last={index === rows.length - 1}
              onChange={replace}
              onMove={(offset) => move(row, index, offset)}
              onRemove={() => remove(row.key)}
              onNext={() => addItem(index + 1)}
            />
          ) : (
            <li key={row.key} className="flex items-start gap-2">
              {renderItem(row, {
                number: ordinal(index, false),
                focus: row.key === added,
                onChange: replace,
                onRemove: () => remove(row.key),
                onNext: () => addItem(index + 1),
              })}
            </li>
          ),
        )}
      </ul>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          aria-label={`Ajouter ${noun}`}
          disabled={items >= limit}
          onClick={() => addItem(rows.length)}
          className={ADD_BUTTON}
        >
          <PlusIcon size={18} strokeWidth={2} />
          {addLabel}
        </button>
        <button
          type="button"
          aria-label={`Ajouter un ${groupNoun}`}
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

export const onEnter = (action: (field: HTMLInputElement) => void) => (event: KeyboardEvent<HTMLInputElement>) => {
  if (event.key !== 'Enter') return
  event.preventDefault()
  action(event.currentTarget)
}

interface GroupProps {
  row: DraftGroup
  label: string
  focus: boolean
  first: boolean
  last: boolean
  onChange: (row: DraftGroup) => void
  onMove: (offset: number) => void
  onRemove: () => void
  onNext: () => void
}

function GroupRow({ row, label, focus, first, last, onChange, onMove, onRemove, onNext }: GroupProps) {
  return (
    <li className="mt-2 flex items-center gap-0.5 first:mt-0">
      <input
        aria-label={`Nom du ${label}`}
        value={row.name}
        onChange={(e) => onChange({ ...row, name: e.target.value.slice(0, RECIPE_LIMITS.group) })}
        onKeyDown={onEnter((field) => {
          const next = field.closest('li')?.nextElementSibling?.querySelector<HTMLElement>('input, textarea')
          if (next) next.focus()
          else onNext()
        })}
        placeholder="ex. Pâte, Crème…"
        autoFocus={focus}
        enterKeyHint="next"
        autoCapitalize="sentences"
        className="mr-1.5 h-11 min-w-0 flex-1 rounded-xl border border-accent/30 bg-accent/8 px-3 text-base font-semibold text-accent outline-none placeholder:font-normal placeholder:text-accent/45 focus:border-accent/60"
      />
      <button type="button" aria-label={`Monter le ${label}`} disabled={first} onClick={() => onMove(-1)} className={ICON_BUTTON}>
        <ChevronIcon size={18} direction="up" />
      </button>
      <button type="button" aria-label={`Descendre le ${label}`} disabled={last} onClick={() => onMove(1)} className={ICON_BUTTON}>
        <ChevronIcon size={18} direction="down" />
      </button>
      <button type="button" aria-label={`Retirer le ${label}`} onClick={onRemove} className={ICON_BUTTON}>
        <CloseIcon size={18} />
      </button>
    </li>
  )
}
