import { useEffect, useState } from 'react'
import { FirebaseError } from 'firebase/app'
import { doc, getDoc } from 'firebase/firestore'
import { AppVersion } from '../components/AppVersion'
import { ProfileOrb } from '../components/ProfileOrb'
import { db } from '../config/firebase'
import type { Profile } from '../config/users'
import { signOutUser } from '../hooks/useAuth'

type DbStatus = 'checking' | 'ok' | 'denied' | 'offline'

const DB_LABEL: Record<DbStatus, string> = {
  checking: 'Connexion à la base…',
  ok: 'Base de données connectée ✓',
  denied: 'Accès refusé : colle les règles Firestore',
  offline: 'Base injoignable pour l’instant',
}

function useDbStatus(uid: string) {
  const [status, setStatus] = useState<DbStatus>('checking')
  useEffect(() => {
    getDoc(doc(db, 'users', uid))
      .then(() => setStatus('ok'))
      .catch((err: unknown) => {
        const denied = err instanceof FirebaseError && err.code === 'permission-denied'
        setStatus(denied ? 'denied' : 'offline')
      })
  }, [uid])
  return status
}

export function HomeScreen({ profile }: { profile: Profile }) {
  const dbStatus = useDbStatus(profile.uid)

  return (
    <main className="safe-screen relative flex h-full flex-col items-center justify-center gap-5 px-6 text-center">
      <ProfileOrb profile={profile} size={72} />
      <h1 className="text-2xl font-semibold">Salut {profile.name}</h1>
      <p className={`text-sm ${dbStatus === 'denied' ? 'text-accent' : 'text-text-2'}`}>
        {DB_LABEL[dbStatus]}
      </p>
      <button
        type="button"
        onClick={() => void signOutUser()}
        className="mt-4 h-11 rounded-full border border-line bg-surface-2 px-5 text-sm"
      >
        Se déconnecter
      </button>
      <AppVersion className="absolute inset-x-0 bottom-[calc(var(--safe-bottom)+20px)]" />
    </main>
  )
}
