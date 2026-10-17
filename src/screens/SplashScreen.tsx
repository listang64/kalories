import { Logo } from '../components/Logo'

export function SplashScreen({ message }: { message?: string }) {
  return (
    <main className="safe-screen flex h-full flex-col items-center px-6">
      <div className="pt-12">
        <Logo size={56} />
      </div>
      {message && <p className="mt-12 animate-pulse text-center text-[17px] text-text-2">{message}</p>}
    </main>
  )
}
