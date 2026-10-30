import { useGameStore } from '../../lib/game/store'
import type { Game } from '../../lib/game/types'
import { revote } from '../../lib/game/voting'
import { BigButton, Hero, Stage } from './ui'

export function TieScreen({ game }: { game: Game }) {
  const apply = useGameStore((s) => s.apply)
  const names = game.tie.map((seat) => game.players[seat]?.name).join(' et ')
  const second = (game.vote?.attempt ?? 0) > 0

  return (
    <Stage>
      <Hero
        emoji="⚖️"
        title="Égalité !"
        text={`${names} ont autant de voix. ${second ? 'Vote décisif' : 'Nouveau vote'} entre eux : tout le monde revote.`}
      />
      <BigButton onClick={() => apply(revote(game))}>Revoter</BigButton>
    </Stage>
  )
}
