import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { MEAL_TYPES, type MealType } from '../config/meals'
import { mealTotals, parseItem, sumTotals, type MealItem, type Totals } from './nutrition'

export interface Meal {
  id: string
  uid: string
  date: string
  type: MealType
  note: string
  items: MealItem[]
  createdAt: Date
}

export interface MealInput {
  type: MealType
  note: string
  items: MealItem[]
}

export interface MealRef {
  id: string
  uid: string
}

export function mealsOf(uid: string) {
  return collection(db, 'users', uid, 'meals')
}

function cleanItems(items: MealItem[]): MealItem[] {
  return items.map(({ name, grams, kcal100, carbs100, fat100, protein100, confidence }) => ({
    name: name.trim() || 'Aliment',
    grams,
    kcal100,
    carbs100,
    fat100,
    protein100,
    confidence,
  }))
}

export function saveMeal(uid: string, meal: MealInput, date: string): Promise<unknown> {
  const items = cleanItems(meal.items)
  return addDoc(mealsOf(uid), {
    uid,
    date,
    type: meal.type,
    createdAt: serverTimestamp(),
    note: meal.note.trim(),
    items,
    totals: mealTotals(items),
  })
}

export function updateMeal(ref: MealRef, meal: Omit<MealInput, 'note'>): Promise<void> {
  const items = cleanItems(meal.items)
  return updateDoc(doc(mealsOf(ref.uid), ref.id), {
    type: meal.type,
    items,
    totals: mealTotals(items),
    updatedAt: serverTimestamp(),
  })
}

export function deleteMeal(ref: MealRef): Promise<void> {
  return deleteDoc(doc(mealsOf(ref.uid), ref.id))
}

export function mealFromDoc(snapshot: QueryDocumentSnapshot): Meal | null {
  const data = snapshot.data({ serverTimestamps: 'estimate' })
  const type = MEAL_TYPES.find((meal) => meal.value === data.type)?.value
  if (typeof data.uid !== 'string' || typeof data.date !== 'string' || !type) return null
  const rawItems: unknown[] = Array.isArray(data.items) ? data.items : []
  const created = data.createdAt as { toDate?: () => Date } | undefined
  return {
    id: snapshot.id,
    uid: data.uid,
    date: data.date,
    type,
    note: typeof data.note === 'string' ? data.note : '',
    items: rawItems.map(parseItem).filter((item): item is MealItem => item !== null),
    createdAt: created?.toDate?.() ?? new Date(),
  }
}

export function dayTotals(meals: Meal[], uid: string): Totals {
  return sumTotals(meals.filter((meal) => meal.uid === uid).map((meal) => mealTotals(meal.items)))
}
