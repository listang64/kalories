import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { isRecipeCategory, type RecipeCategory } from '../config/recipes'

export interface Ingredient {
  name: string
  quantity: string
}

export interface Nutrition {
  grams: number
  kcal100: number
  carbs100: number
  fat100: number
  protein100: number
}

export interface RecipeInput {
  name: string
  category: RecipeCategory
  prepMinutes: number | null
  servings: number | null
  ingredients: Ingredient[]
  steps: string[]
  cookMinutes: number | null
  cookTemp: number | null
  cookNote: string
  nutrition: Nutrition | null
}

export interface Recipe extends RecipeInput {
  id: string
  createdBy: string
  favoriteOf: string[]
}

export const RECIPE_LIMITS = { name: 80, quantity: 40, ingredient: 80, step: 600, note: 120, ingredients: 80, steps: 60 }

export function recipesOf(householdId: string) {
  return collection(db, 'households', householdId, 'recipes')
}

const text = (value: unknown, max: number) => (typeof value === 'string' ? value.trim().slice(0, max) : '')

function count(value: unknown, max: number): number | null {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) && n > 0 ? Math.min(Math.round(n), max) : null
}

function per100(value: unknown, max: number): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? Math.min(Math.round(value * 10) / 10, max) : null
}

function parseNutrition(value: unknown): Nutrition | null {
  if (typeof value !== 'object' || value === null) return null
  const data = value as Record<string, unknown>
  const grams = count(data.grams, 50000)
  const kcal100 = per100(data.kcal100, 900)
  const carbs100 = per100(data.carbs100, 100)
  const fat100 = per100(data.fat100, 100)
  const protein100 = per100(data.protein100, 100)
  if (grams === null || kcal100 === null || carbs100 === null || fat100 === null || protein100 === null) return null
  return { grams, kcal100, carbs100, fat100, protein100 }
}

function parseIngredient(value: unknown): Ingredient | null {
  if (typeof value !== 'object' || value === null) return null
  const data = value as Record<string, unknown>
  const name = text(data.name, RECIPE_LIMITS.ingredient)
  return name ? { name, quantity: text(data.quantity, RECIPE_LIMITS.quantity) } : null
}

const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : [])

export function parseRecipe(data: DocumentData | undefined): RecipeInput | null {
  const name = text(data?.name, RECIPE_LIMITS.name)
  if (!data || !name) return null
  return {
    name,
    category: isRecipeCategory(data.category) ? data.category : 'other',
    prepMinutes: count(data.prepMinutes, 1440),
    servings: count(data.servings, 50),
    ingredients: list(data.ingredients)
      .map(parseIngredient)
      .filter((ingredient): ingredient is Ingredient => ingredient !== null)
      .slice(0, RECIPE_LIMITS.ingredients),
    steps: list(data.steps)
      .map((step) => text(step, RECIPE_LIMITS.step))
      .filter(Boolean)
      .slice(0, RECIPE_LIMITS.steps),
    cookMinutes: count(data.cookMinutes, 1440),
    cookTemp: count(data.cookTemp, 300),
    cookNote: text(data.cookNote, RECIPE_LIMITS.note),
    nutrition: parseNutrition(data.nutrition),
  }
}

export function recipeFromDoc(snapshot: QueryDocumentSnapshot): Recipe | null {
  const recipe = parseRecipe(snapshot.data())
  const createdBy: unknown = snapshot.get('createdBy')
  const favoriteOf = list(snapshot.get('favoriteOf')).filter((uid): uid is string => typeof uid === 'string')
  return recipe && { ...recipe, id: snapshot.id, createdBy: typeof createdBy === 'string' ? createdBy : '', favoriteOf }
}

function record(input: RecipeInput): RecipeInput {
  const recipe = parseRecipe(input)
  if (!recipe) throw new Error('Recette sans nom')
  return recipe
}

export function newRecipeId(householdId: string): string {
  return doc(recipesOf(householdId)).id
}

export function createRecipe(householdId: string, id: string, input: RecipeInput, uid: string): Promise<void> {
  return setDoc(doc(recipesOf(householdId), id), {
    ...record(input),
    createdBy: uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export function updateRecipe(householdId: string, id: string, input: RecipeInput): Promise<void> {
  return updateDoc(doc(recipesOf(householdId), id), { ...record(input), updatedAt: serverTimestamp() })
}

export function setRecipeFavorite(householdId: string, id: string, uid: string, favorite: boolean): Promise<void> {
  return updateDoc(doc(recipesOf(householdId), id), { favoriteOf: favorite ? arrayUnion(uid) : arrayRemove(uid) })
}

export function deleteRecipe(householdId: string, id: string): Promise<void> {
  return deleteDoc(doc(recipesOf(householdId), id))
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const rest = minutes % 60
  return `${Math.floor(minutes / 60)} h${rest ? ` ${String(rest).padStart(2, '0')}` : ''}`
}
