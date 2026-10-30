import { useEffect, useState } from 'react'
import { useGameStore } from '../../lib/game/store'
import type { Game } from '../../lib/game/types'
import { startVote } from '../../lib/game/voting'
import { BigButton, Hero, Stage } from './ui'

const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`

export function DiscussScreen({ game }: { game: Game }) {
  const apply = useGameStore((s) => s.apply)
  const [left, setLeft] = useState(game.settings.timer)
  const [running, setRunning] = useState(game.settings.timer > 0)

  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => setLeft((value) => Math.max(0, value - 1)), 1000)
    return () => window.clearInterval(id)
  }, [running])

  const done = game.settings.timer > 0 && left === 0

  return (
    <Stage>
      <Hero emoji="💬" title="Place au débat" text="Qui vous paraît suspect ? Défendez-vous, accusez, argumentez." />
      {game.settings.timer > 0 && (
        <div className="flex flex-col items-center gap-3">
          <p className={`text-[56px] font-bold tabular-nums ${done ? 'text-accent' : ''}`} aria-live="polite">
            {done ? 'Temps écoulé' : clock(left)}
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setRunning(!running)} className="press h-10 rounded-full bg-white/8 px-4 text-[15px]">
              {running ? 'Pause' : 'Reprendre'}
            </button>
            <button type="button" onClick={() => setLeft(left + 30)} className="press h-10 rounded-full bg-white/8 px-4 text-[15px]">
              +30 s
            </button>
          </div>
        </div>
      )}
      <div className="mt-auto">
        <BigButton onClick={() => apply(startVote(game))}>Passer au vote</BigButton>
      </div>
    </Stage>
  )
}
