import { deleteField, doc, setDoc, updateDoc, type DocumentSnapshot } from 'firebase/firestore'
import { FirebaseError } from 'firebase/app'
import { isAisle, type Aisle } from '../config/aisles'
import { db } from '../config/firebase'

export interface ShoppingItem {
  id: string
  name: string
  quantity: string
  addedBy: string
  order: number
  aisle: Aisle | null
}

export const shoppingDoc = doc(db, 'users', 'liste-de-courses')

const MAX_NAME = 80
const MAX_QUANTITY = 40

export function shoppingErrorMessage(error: unknown): string {
  return error instanceof FirebaseError && error.code === 'permission-denied'
    ? 'Refusé : reconnecte-toi à Kalories'
    : 'Action impossible pour l’instant'
}

export function splitNames(text: string): string[] {
  return text
    .split(/[,;\n]/)
    .map((name) => name.trim().slice(0, MAX_NAME))
    .filter(Boolean)
}

function newId(index: number): string {
  return `i${Date.now().toString(36)}${index}${Math.random().toString(36).slice(2, 7)}`
}

export function addShoppingItems(names: string[], uid: string): Promise<void> {
  const start = Date.now()
  const items = Object.fromEntries(
    names.map((name, i) => [newId(i), { name, quantity: '', addedBy: uid, order: start + i }]),
  )
  return setDoc(shoppingDoc, { items }, { merge: true })
}

export function updateShoppingItem(item: ShoppingItem, name: string, quantity: string): Promise<void> {
  const nextName = name.trim().slice(0, MAX_NAME)
  return updateDoc(shoppingDoc, {
    [`items.${item.id}.name`]: nextName,
    [`items.${item.id}.quantity`]: quantity.trim().slice(0, MAX_QUANTITY),
    ...(nextName !== item.name && { [`items.${item.id}.aisle`]: deleteField() }),
  })
}

export function saveAisles(aisles: Record<string, Aisle>): Promise<void> {
  const fields = Object.entries(aisles).map(([id, aisle]) => [`items.${id}.aisle`, aisle])
  return fields.length > 0 ? updateDoc(shoppingDoc, Object.fromEntries(fields)) : Promise.resolve()
}

export function deleteShoppingItem(id: string): Promise<void> {
  return clearShoppingItems([id])
}

export function clearShoppingItems(ids: string[]): Promise<void> {
  return updateDoc(shoppingDoc, Object.fromEntries(ids.map((id) => [`items.${id}`, deleteField()])))
}

function parseItem(id: string, value: unknown): ShoppingItem | null {
  if (typeof value !== 'object' || value === null) return null
  const data = value as Record<string, unknown>
  if (typeof data.name !== 'string' || !data.name) return null
  return {
    id,
    name: data.name,
    quantity: typeof data.quantity === 'string' ? data.quantity : '',
    addedBy: typeof data.addedBy === 'string' ? data.addedBy : '',
    order: typeof data.order === 'number' ? data.order : 0,
    aisle: isAisle(data.aisle) ? data.aisle : null,
  }
}

export function shoppingItemsFromDoc(snapshot: DocumentSnapshot): ShoppingItem[] {
  const items: unknown = snapshot.get('items')
  if (typeof items !== 'object' || items === null) return []
  return Object.entries(items)
    .map(([id, value]) => parseItem(id, value))
    .filter((item): item is ShoppingItem => item !== null)
    .sort((a, b) => a.order - b.order)
}
