import {
  collection,
  deleteField,
  doc,
  getDocFromServer,
  getDocsFromServer,
  serverTimestamp,
  writeBatch,
  type DocumentSnapshot,
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { sharedDoc } from './household'

export const COUPLE_HOUSEHOLD = 'foyer-nico-chachou'

const COUPLE = [
  { uid: 'Ai6mNQSmQ9M4kSixvyrZORNhbxF2', name: 'Nico', color: 'violet', kcal: 2200 },
  { uid: 'PDR3pus71PSnyTnsaJ1CRc2BAXs2', name: 'Chachou', color: 'rouge', kcal: 1800 },
]
const LEGACY_SHOPPING = doc(db, 'users', 'liste-de-courses')
const LEGACY_LOANS = doc(db, 'users', 'prets')
const MEALS_PER_BATCH = 200

export function isCouple(uid: string): boolean {
  return COUPLE.some((person) => person.uid === uid)
}

export async function migrateCouple(): Promise<void> {
  const profiles = await Promise.all(COUPLE.map((person) => getDocFromServer(doc(db, 'users', person.uid))))
  const batch = writeBatch(db)
  batch.set(doc(db, 'households', COUPLE_HOUSEHOLD), {
    members: COUPLE.map((person) => person.uid),
    createdAt: serverTimestamp(),
  })
  COUPLE.forEach((person, i) => {
    const current = profiles[i]
    batch.set(
      doc(db, 'users', person.uid),
      {
        name: current?.get('name') ?? person.name,
        color: current?.get('color') ?? person.color,
        dailyKcalGoal: current?.get('dailyKcalGoal') ?? person.kcal,
        householdId: COUPLE_HOUSEHOLD,
      },
      { merge: true },
    )
  })
  await batch.commit()
}

function entries(snapshot: DocumentSnapshot, field: string): Record<string, unknown> {
  const value: unknown = snapshot.get(field)
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {}
}

async function moveSharedDocs(householdId: string) {
  const [shopping, loans] = await Promise.all([getDocFromServer(LEGACY_SHOPPING), getDocFromServer(LEGACY_LOANS)])
  const moves = [
    { from: LEGACY_SHOPPING, to: sharedDoc(householdId, 'courses'), field: 'items', values: entries(shopping, 'items') },
    { from: LEGACY_LOANS, to: sharedDoc(householdId, 'prets'), field: 'loans', values: entries(loans, 'loans') },
  ].filter((move) => Object.keys(move.values).length > 0)
  if (moves.length === 0) return
  const batch = writeBatch(db)
  for (const { from, to, field, values } of moves) {
    batch.set(to, { [field]: values }, { merge: true })
    batch.set(from, { [field]: Object.fromEntries(Object.keys(values).map((id) => [id, deleteField()])) }, { merge: true })
  }
  await batch.commit()
}

async function moveMeals() {
  const snapshot = await getDocsFromServer(collection(db, 'meals'))
  const meals = snapshot.docs.filter((meal) => isCouple(String(meal.get('uid'))))
  for (let start = 0; start < meals.length; start += MEALS_PER_BATCH) {
    const batch = writeBatch(db)
    for (const meal of meals.slice(start, start + MEALS_PER_BATCH)) {
      batch.set(doc(db, 'users', String(meal.get('uid')), 'meals', meal.id), meal.data())
      batch.delete(meal.ref)
    }
    await batch.commit()
  }
}

export async function moveLegacyData(householdId: string): Promise<void> {
  await moveSharedDocs(householdId)
  await moveMeals()
}
