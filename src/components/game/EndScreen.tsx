import { CAMPS } from '../../lib/game/camps'
import { powerById } from '../../lib/game/powers'
import { roundEvents } from '../../lib/game/rounds'
import { winnerTitle } from '../../lib/game/scoring'
import type { Game } from '../../lib/game/types'
import { BigButton, Hero, Panel, Stage } from './ui'

export function EndScreen({ game, onReplay, onBoard }: { game: Game; onReplay: () => void; onBoard: () => void }) {
  const winner = game.winner ?? 'civil'
  return (
    <Stage>
      <Hero emoji={CAMPS[winner].emoji} title={winnerTitle(winner)} text={`Partie terminée en ${game.round} manche${game.round > 1 ? 's' : ''}.`} />
      <Panel className="grid grid-cols-2 gap-3 text-center">
        <div>
          <p className="label text-text-2">Mot des civils</p>
          <p className="mt-1 text-[20px] font-semibold">{game.pair.civil}</p>
        </div>
        <div>
          <p className="label text-text-2">Mot des imposteurs</p>
          <p className="mt-1 text-[20px] font-semibold">{game.pair.imposteur}</p>
        </div>
      </Panel>
      <Panel>
        <ul className="divide-y divide-white/6">
          {[...game.players]
            .sort((a, b) => (game.scores?.[b.seat] ?? 0) - (game.scores?.[a.seat] ?? 0))
            .map((player) => (
              <li key={player.seat} className="flex items-center gap-3 py-2.5">
                <span className="text-[22px]">{CAMPS[player.camp].emoji}</span>
                <span className="min-w-0 flex-1">
                  <span className={`block font-semibold ${player.camp === winner ? 'text-accent' : ''}`}>
                    {player.name} {player.alive ? '' : '✝︎'}
                  </span>
                  <span className="block text-[13px] text-text-2">
                    {CAMPS[player.camp].name}
                    {player.powers.map((id) => ` · ${powerById(id).emoji} ${powerById(id).name}`).join('')} · {player.votes} voix
                  </span>
                </span>
                <span className="text-[17px] font-semibold tabular-nums">
                  {(game.scores?.[player.seat] ?? 0) > 0 ? '+' : ''}
                  {game.scores?.[player.seat] ?? 0}
                </span>
              </li>
            ))}
        </ul>
      </Panel>
      {roundEvents(game).length > 0 && (
        <Panel className="text-[14px] leading-snug text-text-2">
          {roundEvents(game).map((event, index) => (
            <p key={index}>{event.text}</p>
          ))}
        </Panel>
      )}
      <BigButton onClick={onReplay}>Rejouer avec les mêmes joueurs</BigButton>
      <BigButton tone="soft" onClick={onBoard}>
        Voir le classement
      </BigButton>
    </Stage>
  )
}
