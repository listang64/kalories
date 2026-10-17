import { deleteDoc, doc, serverTimestamp, setDoc, type QueryDocumentSnapshot } from 'firebase/firestore'
import { db } from '../config/firebase'

export interface SignupCode {
  id: string
  label: string
  usedName: string | null
  createdAt: number
}

export type ShareResult = 'shared' | 'copied' | 'cancelled'

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function generateCode(): string {
  const chars = Array.from(crypto.getRandomValues(new Uint8Array(8)), (n) => ALPHABET[n % ALPHABET.length])
  return `${chars.slice(0, 4).join('')}-${chars.slice(4).join('')}`
}

export async function createSignupCode(label: string): Promise<string> {
  const id = generateCode()
  await setDoc(doc(db, 'signupCodes', id), {
    label: label.trim().slice(0, 40),
    usedBy: null,
    usedName: null,
    usedAt: null,
    createdAt: serverTimestamp(),
  })
  return id
}

export function deleteSignupCode(id: string): Promise<void> {
  return deleteDoc(doc(db, 'signupCodes', id))
}

export function signupCodeFromDoc(snapshot: QueryDocumentSnapshot): SignupCode {
  const data = snapshot.data({ serverTimestamps: 'estimate' })
  const created = data.createdAt as { toMillis?: () => number } | undefined
  return {
    id: snapshot.id,
    label: typeof data.label === 'string' ? data.label : '',
    usedName: typeof data.usedName === 'string' ? data.usedName : null,
    createdAt: created?.toMillis?.() ?? 0,
  }
}

function inviteText(code: string): string {
  const url = new URL(import.meta.env.BASE_URL, window.location.origin).href
  return [
    'Je t’invite sur Kalories !',
    `1. Ouvre ${url} dans Safari`,
    '2. Touche Partager puis « Sur l’écran d’accueil »',
    `3. Ouvre Kalories, touche « Créer un compte » et entre le code ${code}`,
  ].join('\n')
}

export async function shareInvite(code: string): Promise<ShareResult> {
  const text = inviteText(code)
  if (navigator.share) {
    try {
      await navigator.share({ text })
      return 'shared'
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled'
    }
  }
  await navigator.clipboard.writeText(text)
  return 'copied'
}
