import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
  writeBatch,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'
import { db } from '../config/firebase'

export interface ShoppingItem {
  id: string
  name: string
  quantity: string
  addedBy: string
  order: number
}

export const shoppingCollection = collection(db, 'shopping')

const MAX_NAME = 80

export function splitNames(text: string): string[] {
  return text
    .split(/[,;\n]/)
    .map((name) => name.trim().slice(0, MAX_NAME))
    .filter(Boolean)
}

export function addShoppingItems(names: string[], uid: string): Promise<unknown> {
  const start = Date.now()
  return Promise.all(
    names.map((name, i) =>
      addDoc(shoppingCollection, { name, quantity: '', addedBy: uid, order: start + i, createdAt: serverTimestamp() }),
    ),
  )
}

export function updateShoppingItem(id: string, name: string, quantity: string): Promise<void> {
  return updateDoc(doc(shoppingCollection, id), {
    name: name.trim().slice(0, MAX_NAME),
    quantity: quantity.trim().slice(0, 40),
    updatedAt: serverTimestamp(),
  })
}

export function deleteShoppingItem(id: string): Promise<void> {
  return deleteDoc(doc(shoppingCollection, id))
}

export function clearShoppingItems(ids: string[]): Promise<void> {
  const batch = writeBatch(db)
  ids.forEach((id) => batch.delete(doc(shoppingCollection, id)))
  return batch.commit()
}

export function shoppingItemFromDoc(snapshot: QueryDocumentSnapshot): ShoppingItem | null {
  const data = snapshot.data({ serverTimestamps: 'estimate' })
  if (typeof data.name !== 'string' || !data.name) return null
  const created = data.createdAt as { toMillis?: () => number } | undefined
  return {
    id: snapshot.id,
    name: data.name,
    quantity: typeof data.quantity === 'string' ? data.quantity : '',
    addedBy: typeof data.addedBy === 'string' ? data.addedBy : '',
    order: typeof data.order === 'number' ? data.order : (created?.toMillis?.() ?? Date.now()),
  }
}
