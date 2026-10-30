import { useEffect, useState } from 'react'
import { designate, hasJudge, judgeOf, spare } from '../../lib/game/elimination'
import { useGameStore } from '../../lib/game/store'
import type { Game } from '../../lib/game/types'
import { BigButton, Panel, PlayerGrid, Stage } from './ui'

export function EliminationScreen({ game }: { game: Game }) {
  const apply = useGameStore((s) => s.apply)
  const [choice, setChoice] = useState<number | null>(null)
  const [judging, setJudging] = useState(false)
  const alive = game.players.filter((player) => player.alive).map((player) => player.seat)
  const ghosts = game.players.filter((player) => player.ghost)
  const nameOf = (seat: number) => game.players[seat]?.name ?? ''
  const first = game.order[0]
  const judge = judgeOf(game)

  const eliminate = () => {
    if (choice === null) return
    setChoice(null)
    setJudging(false)
    apply(designate(game, choice, judging ? 'juge' : 'vote'))
  }

  return (
    <Stage key={game.round}>
      <div className="text-center">
        <p className="label text-accent">Manche {game.round}</p>
        <h3 className="mt-1 text-[24px] leading-tight font-semibold">
          {judging ? `⚖️ ${judge?.name}, Juge Marteau, tranche !` : 'Qui le groupe élimine-t-il ?'}
        </h3>
        {!judging && (
          <p className="mt-2 text-[15px] leading-snug text-text-2">
            Chacun donne un indice à voix haute{first !== undefined ? `, en commençant par ${nameOf(first)}` : ''}, puis débattez et
            touchez le joueur éliminé.
          </p>
        )}
      </div>
      {game.mime !== null && !judging && (
        <Panel className="text-center text-[15px]">🤐 Le Mime Marcel : {nameOf(game.mime)} donne son indice en mimant.</Panel>
      )}
      {game.settings.timer > 0 && !judging && <Chrono key={game.round} seconds={game.settings.timer} />}
      <PlayerGrid seats={alive} names={nameOf} selected={choice} onSelect={setChoice} />
      {ghosts.length > 0 && <p className="text-center text-[13px] text-text-2">👻 Revenant : {ghosts.map((ghost) => ghost.name).join(', ')}</p>}
      <BigButton disabled={choice === null} onClick={eliminate}>
        {choice === null ? 'Touche un joueur' : `Éliminer ${nameOf(choice)}`}
      </BigButton>
      {judging ? (
        <BigButton tone="soft" onClick={() => setJudging(false)}>
          Retour
        </BigButton>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {hasJudge(game) && (
            <button type="button" onClick={() => setJudging(true)} className="press min-h-12 rounded-full bg-white/8 px-3 text-[14px]">
              ⚖️ Égalité : le Juge tranche
            </button>
          )}
          <button
            type="button"
            onClick={() => apply(spare(game))}
            className={`press min-h-12 rounded-full bg-white/8 px-3 text-[14px] ${hasJudge(game) ? '' : 'col-span-2'}`}
          >
            Personne cette manche
          </button>
        </div>
      )}
    </Stage>
  )
}

function Chrono({ seconds }: { seconds: number }) {
  const [left, setLeft] = useState(seconds)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => setLeft((value) => Math.max(0, value - 1)), 1000)
    return () => window.clearInterval(id)
  }, [running])

  const label = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`
  return (
    <button
      type="button"
      onClick={() => (left === 0 ? (setLeft(seconds), setRunning(true)) : setRunning(!running))}
      className={`press mx-auto flex h-11 items-center gap-2 rounded-full bg-white/8 px-5 text-[17px] font-semibold tabular-nums ${left === 0 ? 'text-accent' : ''}`}
    >
      ⏱ {left === 0 ? 'Temps écoulé · relancer' : running ? `${label} · pause` : `Débat ${label}`}
    </button>
  )
}
