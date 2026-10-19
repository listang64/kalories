import { collection, deleteDoc, doc, setDoc, type QueryDocumentSnapshot } from 'firebase/firestore'
import { db } from '../config/firebase'
import { itemTotals, parseItem, sumTotals, type MealItem } from './nutrition'

export type FavoriteInput = Omit<MealItem, 'confidence'>

export interface Favorite extends FavoriteInput {
  id: string
}

export function favoritesOf(uid: string) {
  return collection(db, 'users', uid, 'favorites')
}

function record({ name, grams, kcal100, carbs100, fat100, protein100 }: FavoriteInput): FavoriteInput {
  return { name: name.trim().slice(0, 60), grams, kcal100, carbs100, fat100, protein100 }
}

export function newFavoriteId(uid: string): string {
  return doc(favoritesOf(uid)).id
}

export function saveFavorite(uid: string, id: string, input: FavoriteInput): Promise<void> {
  return setDoc(doc(favoritesOf(uid), id), record(input))
}

export function deleteFavorite(uid: string, id: string): Promise<void> {
  return deleteDoc(doc(favoritesOf(uid), id))
}

export function favoriteFromDoc(snapshot: QueryDocumentSnapshot): Favorite | null {
  const item = parseItem(snapshot.data())
  if (!item) return null
  const { confidence: _, ...values } = item
  return { id: snapshot.id, ...values }
}

export function favoriteItem(favorite: Favorite, grams: number): MealItem {
  const { id: _, ...values } = favorite
  return { ...values, grams, confidence: 'haute' }
}

export function combineItems(items: MealItem[]): Omit<FavoriteInput, 'name'> | null {
  const grams = items.reduce((sum, item) => sum + item.grams, 0)
  if (grams <= 0) return null
  const totals = sumTotals(items.map(itemTotals))
  const per100 = (value: number) => Math.round((value / grams) * 1000) / 10
  return {
    grams: Math.round(grams),
    kcal100: per100(totals.kcal),
    carbs100: per100(totals.carbs),
    fat100: per100(totals.fat),
    protein100: per100(totals.protein),
  }
}
