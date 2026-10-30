import { deleteField, setDoc, type DocumentSnapshot } from 'firebase/firestore'
import { currentSharedDoc } from '../household'

export const playedFromDoc = (snapshot: DocumentSnapshot): string[] =>
  Object.keys((snapshot.data()?.played as Record<string, unknown> | undefined) ?? {})

export function markPlayed(id: string, reset: string[]): Promise<void> {
  const played = Object.fromEntries([...reset.map((old) => [old, deleteField()]), [id, true]])
  return setDoc(currentSharedDoc('imposteur'), { played }, { merge: true })
}
