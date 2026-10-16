import { create } from 'zustand'
import { FirebaseError } from 'firebase/app'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth } from '../config/firebase'
import { profileById, profileByUid, type Profile } from '../config/users'

const LAST_PROFILE_KEY = 'kalories.profile'

interface AuthState {
  profile: Profile | null
  ready: boolean
}

const remembered = profileById(localStorage.getItem(LAST_PROFILE_KEY))

const useAuthStore = create<AuthState>()(() => ({
  profile: remembered,
  ready: remembered !== null,
}))

export function watchAuth() {
  onAuthStateChanged(auth, (user) => {
    const profile = user ? profileByUid(user.uid) : null
    if (user && !profile) void signOut(auth)
    if (profile) localStorage.setItem(LAST_PROFILE_KEY, profile.id)
    else localStorage.removeItem(LAST_PROFILE_KEY)
    useAuthStore.setState({ profile, ready: true })
  })
}

export function useAuth() {
  return useAuthStore()
}

export async function signIn(profile: Profile, password: string) {
  await signInWithEmailAndPassword(auth, profile.email, password)
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
      return 'Mot de passe incorrect'
    case 'auth/user-not-found':
      return 'Compte introuvable'
    case 'auth/too-many-requests':
      return 'Trop d’essais, réessaie dans quelques minutes'
    case 'auth/network-request-failed':
      return 'Pas de connexion internet'
    default:
      return 'Connexion impossible pour l’instant'
  }
}
