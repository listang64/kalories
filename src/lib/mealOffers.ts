import { useEffect, useState } from 'react'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  writeBatch,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'
import { MEAL_TYPES } from '../config/meals'
import { db } from '../config/firebase'
import { mealRecord, mealsOf, type Meal, type MealInput } from './meals'
import { parseItem, type MealItem } from './nutrition'
import type { Profile } from './profiles'

export interface MealOffer extends MealInput {
  id: string
  from: string
  fromName: string
  date: string
}

function inboxOf(uid: string) {
  return collection(db, 'users', uid, 'inbox')
}

function offerFromDoc(snapshot: QueryDocumentSnapshot): MealOffer | null {
  const data = snapshot.data()
  const type = MEAL_TYPES.find((meal) => meal.value === data.type)?.value
  const rawItems: unknown[] = Array.isArray(data.items) ? data.items : []
  const items = rawItems.map(parseItem).filter((item): item is MealItem => item !== null)
  if (!type || typeof data.date !== 'string' || typeof data.from !== 'string' || items.length === 0) return null
  return {
    id: snapshot.id,
    from: data.from,
    fromName: typeof data.fromName === 'string' ? data.fromName : '',
    date: data.date,
    type,
    note: typeof data.note === 'string' ? data.note : '',
    items,
  }
}

export function shareMeal(meal: Meal, from: Profile, to: Profile): Promise<unknown> {
  return addDoc(inboxOf(to.uid), {
    from: from.uid,
    fromName: from.name,
    type: meal.type,
    date: meal.date,
    note: meal.note,
    items: meal.items,
    createdAt: serverTimestamp(),
  })
}

export function useMealOffers(uid: string): MealOffer[] {
  const [offers, setOffers] = useState<MealOffer[]>([])

  useEffect(
    () =>
      onSnapshot(
        query(inboxOf(uid), orderBy('createdAt')),
        (snapshot) => setOffers(snapshot.docs.map(offerFromDoc).filter((offer): offer is MealOffer => offer !== null)),
        () => setOffers([]),
      ),
    [uid],
  )

  return offers
}

export async function acceptOffer(uid: string, offer: MealOffer): Promise<void> {
  const batch = writeBatch(db)
  batch.set(doc(mealsOf(uid)), mealRecord(uid, offer, offer.date))
  batch.delete(doc(inboxOf(uid), offer.id))
  await batch.commit()
}

export function declineOffer(uid: string, offer: MealOffer): Promise<void> {
  return deleteDoc(doc(inboxOf(uid), offer.id))
}
