import { Component, type ReactNode } from 'react'
import { KaloriesMark } from './icons/KaloriesMark'

interface State {
  failed: boolean
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <main className="safe-screen flex h-full flex-col items-center justify-center gap-5 px-8 text-center">
        <KaloriesMark size={72} />
        <div>
          <h1 className="text-[20px] font-semibold">Oups, Kalories a eu un souci</h1>
          <p className="mt-1.5 text-[15px] text-text-2">Tes repas sont en sécurité. Relance l’app pour continuer.</p>
        </div>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="press h-12 rounded-full bg-accent px-8 font-semibold text-black shadow-accent"
        >
          Relancer
        </button>
      </main>
    )
  }
}
