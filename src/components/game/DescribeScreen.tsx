import { useState } from 'react'
import { nextSpeaker } from '../../lib/game/rounds'
import { useGameStore } from '../../lib/game/store'
import type { Game } from '../../lib/game/types'
import { BigButton, Panel, Stage } from './ui'

export function DescribeScreen({ game }: { game: Game }) {
  const apply = useGameStore((s) => s.apply)
  const seat = game.order[game.turn] ?? 0
  const speaker = game.players[seat]
  const ghosts = game.players.filter((player) => player.ghost)

  return (
    <Stage key={`${game.round}-${game.turn}`}>
      <p className="text-center text-[14px] text-text-2">
        Manche {game.round} · indice {game.turn + 1} / {game.order.length}
      </p>
      <div className="py-4 text-center">
        <p className="text-[15px] text-text-2">C’est au tour de</p>
        <p className="mt-1 text-[38px] leading-tight font-bold text-accent">{speaker?.name}</p>
        <p className="mt-2 text-[15px] text-text-2">Donne un indice sur ton mot, à voix haute, sans le dire.</p>
      </div>
      {game.mime !== null && <MimeOrder key={seat} mime={game.mime === seat} />}
      <Panel>
        <ul className="flex flex-wrap gap-2">
          {game.order.map((id, index) => (
            <li
              key={id}
              className={`rounded-full px-3 py-1.5 text-[14px] ${
                index === game.turn ? 'bg-accent text-black' : index < game.turn ? 'bg-white/8 text-text-2 line-through' : 'bg-white/8'
              }`}
            >
              {game.players[id]?.name}
            </li>
          ))}
        </ul>
        {ghosts.length > 0 && (
          <p className="mt-3 text-[13px] text-text-2">👻 Revenant : {ghosts.map((ghost) => ghost.name).join(', ')}</p>
        )}
      </Panel>
      <BigButton onClick={() => apply(nextSpeaker(game))}>
        {game.turn + 1 < game.order.length ? 'Joueur suivant' : 'Passer à la discussion'}
      </BigButton>
    </Stage>
  )
}

function MimeOrder({ mime }: { mime: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <button
      type="button"
      onPointerDown={() => setOpen(true)}
      onPointerUp={() => setOpen(false)}
      onPointerLeave={() => setOpen(false)}
      onContextMenu={(e) => e.preventDefault()}
      className="flex min-h-16 w-full items-center justify-center rounded-card border border-dashed border-white/20 px-4 text-center text-[16px] select-none"
    >
      {open ? (mime ? '🤐 Le Mime Marcel : cette manche, mime ton indice sans parler !' : '🗣️ Donne ton indice à voix haute.') : '🤐 Garde le doigt appuyé pour ta consigne secrète'}
    </button>
  )
}
