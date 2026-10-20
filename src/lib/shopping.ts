import { deleteField, setDoc, updateDoc, type DocumentSnapshot } from 'firebase/firestore'
import { isAisle, type Aisle } from '../config/aisles'
import { currentSharedDoc } from './household'
import { sumQuantities } from './recipeScale'
import { newId } from './shared'

export interface ShoppingItem {
  id: string
  name: string
  quantity: string
  addedBy: string
  order: number
  aisle: Aisle | null
}

const MAX_NAME = 80
const MAX_QUANTITY = 40

export function sameItem(a: string, b: string): boolean {
  const key = (name: string) =>
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/s\b/g, '')
      .trim()
  return key(a) === key(b)
}

export function splitNames(text: string): string[] {
  return text
    .split(/[,;\n]/)
    .map((name) => name.trim().slice(0, MAX_NAME))
    .filter(Boolean)
}

export interface ShoppingEntry {
  name: string
  quantity: string
}

export function mergeEntries(entries: ShoppingEntry[]): ShoppingEntry[] {
  const merged: { name: string; quantities: string[] }[] = []
  for (const { name, quantity } of entries) {
    const entry = merged.find((item) => sameItem(item.name, name))
    if (entry) entry.quantities.push(quantity)
    else merged.push({ name, quantities: [quantity] })
  }
  return merged.map(({ name, quantities }) => ({ name, quantity: sumQuantities(quantities) }))
}

export async function addShoppingItems(entries: ShoppingEntry[], uid: string): Promise<void> {
  const start = Date.now()
  const items = Object.fromEntries(
    entries.map(({ name, quantity }, i) => [
      newId(i),
      { name: name.slice(0, MAX_NAME), quantity: quantity.slice(0, MAX_QUANTITY), addedBy: uid, order: start + i },
    ]),
  )
  await setDoc(currentSharedDoc('courses'), { items }, { merge: true })
}

export async function updateShoppingItem(item: ShoppingItem, name: string, quantity: string): Promise<void> {
  const nextName = name.trim().slice(0, MAX_NAME)
  await updateDoc(currentSharedDoc('courses'), {
    [`items.${item.id}.name`]: nextName,
    [`items.${item.id}.quantity`]: quantity.trim().slice(0, MAX_QUANTITY),
    ...(nextName !== item.name && { [`items.${item.id}.aisle`]: deleteField() }),
  })
}

export async function saveAisles(aisles: Record<string, Aisle>): Promise<void> {
  const fields = Object.entries(aisles).map(([id, aisle]) => [`items.${id}.aisle`, aisle])
  if (fields.length > 0) await updateDoc(currentSharedDoc('courses'), Object.fromEntries(fields))
}

export function deleteShoppingItem(id: string): Promise<void> {
  return clearShoppingItems([id])
}

export async function clearShoppingItems(ids: string[]): Promise<void> {
  await updateDoc(currentSharedDoc('courses'), Object.fromEntries(ids.map((id) => [`items.${id}`, deleteField()])))
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
