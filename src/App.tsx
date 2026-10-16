import { Logo } from './components/Logo'
import { Toast } from './components/Toast'
import { useAppUpdate } from './hooks/useAppUpdate'

const buildDate = new Date(__BUILD_DATE__).toLocaleString('fr-FR', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

export default function App() {
  useAppUpdate()

  return (
    <main className="safe-screen relative flex h-full flex-col items-center justify-center">
      <Logo size={112} />
      <p className="label mt-6">Bientôt : Nico & Chachou</p>
      <footer className="absolute inset-x-0 bottom-[calc(var(--safe-bottom)+20px)] text-center text-xs text-text-2 tabular-nums">
        Version {__APP_VERSION__} · {buildDate}
      </footer>
      <Toast />
    </main>
  )
}
