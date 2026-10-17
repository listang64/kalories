import { Logo } from '../components/Logo'

export function SplashScreen() {
  return (
    <main className="safe-screen flex h-full flex-col items-center px-6">
      <div className="pt-12">
        <Logo size={56} />
      </div>
      <p className="mt-12 animate-pulse text-center text-[17px] text-text-2">Préparation de votre foyer…</p>
    </main>
  )
}
