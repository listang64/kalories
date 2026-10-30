import { roundEvents, startRound } from '../../lib/game/rounds'
import { useGameStore } from '../../lib/game/store'
import type { Game } from '../../lib/game/types'
import { BigButton, Hero, Panel, Stage } from './ui'

export function SummaryScreen({ game }: { game: Game }) {
  const apply = useGameStore((s) => s.apply)
  const alive = game.players.filter((player) => player.alive)
  return (
    <Stage>
      <Hero emoji="📜" title={`Fin de la manche ${game.round}`} />
      <Panel>
        <ul className="flex flex-col gap-2.5 text-[16px] leading-snug">
          {roundEvents(game).map((event, index) => (
            <li key={index}>{event.text}</li>
          ))}
        </ul>
      </Panel>
      <p className="text-center text-[14px] text-text-2">
        Encore en jeu : {alive.map((player) => player.name).join(', ')}
      </p>
      <BigButton onClick={() => apply(startRound(game))}>Manche suivante</BigButton>
    </Stage>
  )
}
