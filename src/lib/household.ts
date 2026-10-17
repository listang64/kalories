import { useMemo } from 'react'
import { doc, type DocumentReference } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useSession } from '../store/sessionStore'

export type SharedName = 'courses' | 'prets'

export function sharedDoc(householdId: string, name: SharedName): DocumentReference {
  return doc(db, 'households', householdId, 'shared', name)
}

export function currentSharedDoc(name: SharedName): DocumentReference {
  const householdId = useSession.getState().householdId
  if (!householdId) throw new Error('Aucun foyer')
  return sharedDoc(householdId, name)
}

export function useSharedRef(name: SharedName): DocumentReference | null {
  const householdId = useSession((s) => s.householdId)
  return useMemo(() => (householdId ? sharedDoc(householdId, name) : null), [householdId, name])
}
