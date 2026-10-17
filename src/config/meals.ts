export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export const MEAL_TYPES: { value: MealType; label: string }[] = [
  { value: 'breakfast', label: 'Petit-déj' },
  { value: 'lunch', label: 'Déjeuner' },
  { value: 'dinner', label: 'Souper' },
  { value: 'snack', label: 'En-cas' },
]

export function mealLabel(type: MealType): string {
  return MEAL_TYPES.find((meal) => meal.value === type)?.label ?? ''
}

export function probableMealType(date = new Date()): MealType {
  const minutes = date.getHours() * 60 + date.getMinutes()
  if (minutes < 10 * 60 + 30) return 'breakfast'
  if (minutes >= 11 * 60 && minutes < 15 * 60) return 'lunch'
  if (minutes >= 18 * 60 && minutes < 23 * 60) return 'dinner'
  return 'snack'
}
