export type RecipeCategory = 'starter' | 'main' | 'dessert' | 'other'

export interface CategoryMeta {
  value: RecipeCategory
  label: string
  plural: string
}

export const RECIPE_CATEGORIES: CategoryMeta[] = [
  { value: 'starter', label: 'Entrée', plural: 'Entrées' },
  { value: 'main', label: 'Plat', plural: 'Plats' },
  { value: 'dessert', label: 'Dessert', plural: 'Desserts' },
  { value: 'other', label: 'Autre', plural: 'Autres' },
]

export function isRecipeCategory(value: unknown): value is RecipeCategory {
  return RECIPE_CATEGORIES.some((category) => category.value === value)
}

export function categoryLabel(value: RecipeCategory): string {
  return RECIPE_CATEGORIES.find((category) => category.value === value)?.label ?? 'Autre'
}
