import { useState } from 'react'
import { useGameStore } from '../../lib/game/store'
import type { Game } from '../../lib/game/types'
import { castVote, choicesFor, nextVoter } from '../../lib/game/voting'
import { BigButton, Hero, PlayerGrid, Stage } from './ui'

export function VoteScreen({ game }: { game: Game }) {
  const apply = useGameStore((s) => s.apply)
  const voter = nextVoter(game)
  const [ready, setReady] = useState(false)
  const [choice, setChoice] = useState<number | null>(null)
  const vote = game.vote
  if (voter === null || !vote) return null
  const done = Object.keys(vote.ballots).length
  const player = game.players[voter]
  const nameOf = (seat: number) => game.players[seat]?.name ?? ''

  if (!ready) {
    return (
      <Stage key={`pass-${voter}`}>
        <p className="text-center text-[14px] text-text-2">
          {vote.attempt > 0 ? 'Second vote · ' : ''}Vote {done + 1} / {vote.voters.length}
        </p>
        <Hero emoji={player?.ghost ? '👻' : '🗳️'} title={`Passe le téléphone à ${player?.name}`} text="Ton vote reste secret." />
        <BigButton onClick={() => setReady(true)}>C’est moi, je vote</BigButton>
      </Stage>
    )
  }

  return (
    <Stage key={`vote-${voter}`}>
      <p className="text-center text-[17px]">
        <span className="font-semibold">{player?.name}</span>, contre qui votes-tu ?
      </p>
      <PlayerGrid seats={choicesFor(game, voter)} names={nameOf} selected={choice} onSelect={setChoice} />
      <BigButton
        disabled={choice === null}
        onClick={() => {
          if (choice === null) return
          setReady(false)
          setChoice(null)
          apply(castVote(game, voter, choice))
        }}
      >
        {choice === null ? 'Choisis un joueur' : `Confirmer : ${nameOf(choice)}`}
      </BigButton>
    </Stage>
  )
}
