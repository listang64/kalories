import { FirebaseError } from 'firebase/app'

export function sharedErrorMessage(error: unknown): string {
  return error instanceof FirebaseError && error.code === 'permission-denied'
    ? 'Refusé : reconnecte-toi à Kalories'
    : 'Action impossible pour l’instant'
}

export function newId(index = 0): string {
  return `i${Date.now().toString(36)}${index}${Math.random().toString(36).slice(2, 7)}`
}
