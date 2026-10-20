import type { RecipeCategory } from '../config/recipes'
import type { Nutrition, RecipeInput } from './recipes'

export type Per100Key = 'kcal100' | 'carbs100' | 'fat100' | 'protein100'

export interface DraftItem {
  kind: 'item'
  key: string
}

export interface DraftIngredient extends DraftItem {
  name: string
  quantity: string
}

export interface DraftStep extends DraftItem {
  text: string
}

export interface DraftGroup {
  kind: 'group'
  key: string
  name: string
}

export type DraftRow<Item extends DraftItem> = Item | DraftGroup

export interface RecipeDraft {
  name: string
  category: RecipeCategory
  prep: string
  servings: string
  ingredients: DraftRow<DraftIngredient>[]
  steps: DraftRow<DraftStep>[]
  cookMinutes: string
  cookTemp: string
  cookNote: string
  weight: string
  values: Record<Per100Key, string>
  anchor: Nutrition | null
}

export const PER100_KEYS: Per100Key[] = ['kcal100', 'carbs100', 'fat100', 'protein100']

let counter = 0
export const draftKey = () => `k${(counter += 1)}`
export const emptyIngredient = (): DraftIngredient => ({ kind: 'item', key: draftKey(), name: '', quantity: '' })
export const emptyStep = (): DraftStep => ({ kind: 'item', key: draftKey(), text: '' })
export const emptyGroup = (): DraftGroup => ({ kind: 'group', key: draftKey(), name: '' })
export const isGroup = <Item extends DraftItem>(row: DraftRow<Item>): row is DraftGroup => row.kind === 'group'

export const decimal = (value: number) => String(value).replace('.', ',')
const whole = (value: number | null) => (value ? String(value) : '')

export function parseDecimal(text: string): number | null {
  const value = Number(text.replace(',', '.'))
  return text.trim() !== '' && Number.isFinite(value) ? value : null
}

export function valuesOf(nutrition: Nutrition | null): Record<Per100Key, string> {
  return Object.fromEntries(PER100_KEYS.map((key) => [key, nutrition ? decimal(nutrition[key]) : ''])) as Record<
    Per100Key,
    string
  >
}

export function rescale(anchor: Nutrition, grams: number): Record<Per100Key, string> {
  const factor = anchor.grams / grams
  const scaled = Object.fromEntries(PER100_KEYS.map((key) => [key, Math.round(anchor[key] * factor * 10) / 10]))
  return valuesOf({ ...anchor, ...scaled })
}

export function draftNutrition(weight: string, values: Record<Per100Key, string>): Nutrition | null {
  const grams = parseDecimal(weight)
  const parsed = PER100_KEYS.map((key) => parseDecimal(values[key]))
  const [kcal100, carbs100, fat100, protein100] = parsed
  if (!grams || kcal100 == null || carbs100 == null || fat100 == null || protein100 == null) return null
  return { grams: Math.round(grams), kcal100, carbs100, fat100, protein100 }
}

function toRows<T extends { group: string }, Item extends DraftItem>(
  items: T[],
  row: (item: T) => Item,
  empty: () => Item,
): DraftRow<Item>[] {
  const rows = items.flatMap((item, index): DraftRow<Item>[] => [
    ...(item.group !== (items[index - 1]?.group ?? '') ? [{ ...emptyGroup(), name: item.group }] : []),
    row(item),
  ])
  return rows.length ? rows : [empty()]
}

function fromRows<Item extends DraftItem, T>(rows: DraftRow<Item>[], item: (row: Item, group: string) => T): T[] {
  let group = ''
  return rows.flatMap((row) => {
    if (!isGroup(row)) return [item(row, group)]
    group = row.name.trim()
    return []
  })
}

export function toDraft(recipe: RecipeInput | null): RecipeDraft {
  return {
    name: recipe?.name ?? '',
    category: recipe?.category ?? 'main',
    prep: whole(recipe?.prepMinutes ?? null),
    servings: whole(recipe?.servings ?? null),
    ingredients: toRows(recipe?.ingredients ?? [], ({ name, quantity }) => ({ ...emptyIngredient(), name, quantity }), emptyIngredient),
    steps: toRows(recipe?.steps ?? [], ({ text }) => ({ ...emptyStep(), text }), emptyStep),
    cookMinutes: whole(recipe?.cookMinutes ?? null),
    cookTemp: whole(recipe?.cookTemp ?? null),
    cookNote: recipe?.cookNote ?? '',
    weight: whole(recipe?.nutrition?.grams ?? null),
    values: valuesOf(recipe?.nutrition ?? null),
    anchor: recipe?.nutrition ?? null,
  }
}

export function withContent(draft: RecipeDraft, recipe: RecipeInput): RecipeDraft {
  const next = toDraft(recipe)
  return { ...next, name: next.name || draft.name, weight: '', values: valuesOf(null), anchor: null }
}

export function fromDraft(draft: RecipeDraft): RecipeInput {
  return {
    name: draft.name,
    category: draft.category,
    prepMinutes: parseDecimal(draft.prep),
    servings: parseDecimal(draft.servings),
    ingredients: fromRows(draft.ingredients, ({ name, quantity }, group) => ({ name, quantity, group })),
    steps: fromRows(draft.steps, ({ text }, group) => ({ text, group })),
    cookMinutes: parseDecimal(draft.cookMinutes),
    cookTemp: parseDecimal(draft.cookTemp),
    cookNote: draft.cookNote,
    nutrition: draftNutrition(draft.weight, draft.values),
  }
}

export function ingredientLines(draft: RecipeDraft): string[] {
  return draft.ingredients
    .filter((row): row is DraftIngredient => !isGroup(row) && row.name.trim() !== '')
    .map((ingredient) => `${ingredient.quantity.trim()} ${ingredient.name.trim()}`.trim())
}
