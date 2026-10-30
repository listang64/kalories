import { CAMPS } from '../../lib/game/camps'
import { useGameStore } from '../../lib/game/store'
import { winnerTitle } from '../../lib/game/scoring'
import { Hero, Panel, Stage } from './ui'

const time = (at: number) => new Date(at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

export function GameHistory() {
  const history = useGameStore((s) => s.history)
  if (history.length === 0) {
    return (
      <Stage>
        <Hero emoji="📚" title="Pas encore d’historique" text="Les parties terminées apparaîtront ici." />
      </Stage>
    )
  }
  return (
    <Stage>
      {history.map((entry) => (
        <Panel key={entry.id}>
          <p className="flex items-baseline justify-between gap-3">
            <span className="text-[16px] font-semibold">
              {CAMPS[entry.winner].emoji} {winnerTitle(entry.winner)}
            </span>
            <span className="shrink-0 text-[13px] text-text-2">{time(entry.at)}</span>
          </p>
          <p className="mt-1 text-[14px] text-text-2">
            {entry.civil} / {entry.imposteur} · {entry.category} · {entry.rounds} manche{entry.rounds > 1 ? 's' : ''}
          </p>
          <p className="mt-2 text-[14px] leading-relaxed">
            {entry.players.map((player) => `${player.won ? '★ ' : ''}${player.name} (${CAMPS[player.camp].name}, ${player.points > 0 ? '+' : ''}${player.points})`).join(' · ')}
          </p>
        </Panel>
      ))}
    </Stage>
  )
}
