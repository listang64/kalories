import { Logo } from '../components/Logo'
import { signOutUser } from '../lib/auth'

export function SplashScreen({ status }: { status: 'migrating' | 'incomplete' }) {
  return (
    <main className="safe-screen flex h-full flex-col items-center px-6">
      <div className="pt-12">
        <Logo size={56} />
      </div>
      {status === 'migrating' ? (
        <p className="mt-12 animate-pulse text-center text-[17px] text-text-2">Préparation de votre foyer…</p>
      ) : (
        <>
          <p className="mt-12 max-w-72 text-center text-[17px] text-text-2">Ce compte n’a pas encore de profil Kalories.</p>
          <button type="button" onClick={() => void signOutUser()} className="mt-6 h-11 text-[17px] text-accent">
            Se déconnecter
          </button>
        </>
      )}
    </main>
  )
}
