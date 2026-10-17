import { FirebaseError } from 'firebase/app'
import { sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth } from '../config/firebase'

const EMAIL_KEY = 'kalories.email'

export function lastEmail(): string {
  return localStorage.getItem(EMAIL_KEY) ?? ''
}

export function cleanEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function rememberEmail(email: string) {
  localStorage.setItem(EMAIL_KEY, cleanEmail(email))
}

export async function signIn(email: string, password: string) {
  await signInWithEmailAndPassword(auth, cleanEmail(email), password)
  rememberEmail(email)
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, cleanEmail(email))
}

export async function signOutUser() {
  await signOut(auth)
}

export function authErrorMessage(error: unknown): string {
  const code = error instanceof FirebaseError ? error.code : ''
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'E-mail ou mot de passe incorrect'
    case 'auth/invalid-email':
    case 'auth/missing-email':
      return 'Adresse e-mail invalide'
    case 'auth/email-already-in-use':
      return 'Cette adresse a déjà un compte : connecte-toi'
    case 'auth/weak-password':
    case 'auth/missing-password':
      return 'Mot de passe trop court : 6 caractères minimum'
    case 'auth/too-many-requests':
      return 'Trop d’essais, réessaie dans quelques minutes'
    case 'auth/network-request-failed':
      return 'Pas de connexion internet'
    default:
      return 'Connexion impossible pour l’instant'
  }
}
