import { FirebaseError } from 'firebase/app'

export function sharedErrorMessage(error: unknown): string {
  return error instanceof FirebaseError && error.code === 'permission-denied'
    ? 'Refusé : reconnecte-toi à Kalories'
    : 'Action impossible pour l’instant'
}

export function newId(index = 0): string {
  return `i${Date.now().toString(36)}${index}${Math.random().toString(36).slice(2, 7)}`
}

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function randomCode(length = 6): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(length)), (n) => CODE_ALPHABET[n % CODE_ALPHABET.length]).join('')
}

export function normalizeCode(text: string, length = 6): string {
  return text
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, length)
}
