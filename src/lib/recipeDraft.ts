import type { RecipeCategory } from '../config/recipes'
import type { Ingredient, Nutrition, RecipeInput } from './recipes'

export type Per100Key = 'kcal100' | 'carbs100' | 'fat100' | 'protein100'

export interface DraftIngredient {
  kind: 'ingredient'
  key: string
  name: string
  quantity: string
}

export interface DraftGroup {
  kind: 'group'
  key: string
  name: string
}

export type DraftIngredientRow = DraftIngredient | DraftGroup

export interface DraftStep {
  key: string
  text: string
}

export interface RecipeDraft {
  name: string
  category: RecipeCategory
  prep: string
  servings: string
  ingredients: DraftIngredientRow[]
  steps: DraftStep[]
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
export const emptyIngredient = (): DraftIngredient => ({ kind: 'ingredient', key: draftKey(), name: '', quantity: '' })
export const emptyGroup = (): DraftGroup => ({ kind: 'group', key: draftKey(), name: '' })

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

function ingredientRows(ingredients: Ingredient[]): DraftIngredientRow[] {
  const rows = ingredients.flatMap(({ name, quantity, group }, index): DraftIngredientRow[] => [
    ...(group !== (ingredients[index - 1]?.group ?? '') ? [{ ...emptyGroup(), name: group }] : []),
    { ...emptyIngredient(), name, quantity },
  ])
  return rows.length ? rows : [emptyIngredient()]
}

function draftIngredients(rows: DraftIngredientRow[]): Ingredient[] {
  let group = ''
  return rows.flatMap((row) => {
    if (row.kind === 'group') group = row.name.trim()
    return row.kind === 'ingredient' ? [{ name: row.name, quantity: row.quantity, group }] : []
  })
}

export function toDraft(recipe: RecipeInput | null): RecipeDraft {
  return {
    name: recipe?.name ?? '',
    category: recipe?.category ?? 'main',
    prep: whole(recipe?.prepMinutes ?? null),
    servings: whole(recipe?.servings ?? null),
    ingredients: ingredientRows(recipe?.ingredients ?? []),
    steps: (recipe?.steps.length ? recipe.steps : ['']).map((text) => ({ key: draftKey(), text })),
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
    ingredients: draftIngredients(draft.ingredients),
    steps: draft.steps.map((step) => step.text),
    cookMinutes: parseDecimal(draft.cookMinutes),
    cookTemp: parseDecimal(draft.cookTemp),
    cookNote: draft.cookNote,
    nutrition: draftNutrition(draft.weight, draft.values),
  }
}

export function ingredientLines(draft: RecipeDraft): string[] {
  return draft.ingredients
    .filter((row): row is DraftIngredient => row.kind === 'ingredient' && row.name.trim() !== '')
    .map((ingredient) => `${ingredient.quantity.trim()} ${ingredient.name.trim()}`.trim())
}
