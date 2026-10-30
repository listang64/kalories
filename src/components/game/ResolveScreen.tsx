import { useState } from 'react'
import { judgeOf } from '../../lib/game/elimination'
import { eliminateSeat, guessWord } from '../../lib/game/engine'
import { useGameStore } from '../../lib/game/store'
import type { Game } from '../../lib/game/types'
import { BigButton, Hero, PlayerGrid, Stage } from './ui'

export function ResolveScreen({ game }: { game: Game }) {
  const pending = game.queue[0]
  if (!pending) return null
  if (pending.kind === 'guess') return <GuessStep key={`g${pending.seat}`} game={game} seat={pending.seat} />
  const judge = judgeOf(game)
  const seats =
    pending.kind === 'judge'
      ? pending.seats
      : game.players.filter((player) => player.alive && player.seat !== pending.seat).map((player) => player.seat)
  const who = game.players[pending.kind === 'judge' ? (judge?.seat ?? -1) : pending.seat]?.name ?? ''
  return pending.kind === 'judge' ? (
    <PickStep key="judge" game={game} seats={seats} emoji="⚖️" title={`${who}, Juge Marteau, tranche !`} text="L’égalité persiste : choisis qui quitte la partie." cause="juge" />
  ) : (
    <PickStep key={`r${pending.seat}`} game={game} seats={seats} emoji="😤" title={`${who} était la Rancunière`} text="Choisis qui part avec toi." cause="vengeance" />
  )
}

function PickStep({ game, seats, emoji, title, text, cause }: { game: Game; seats: number[]; emoji: string; title: string; text: string; cause: 'juge' | 'vengeance' }) {
  const apply = useGameStore((s) => s.apply)
  const [choice, setChoice] = useState<number | null>(null)
  const nameOf = (seat: number) => game.players[seat]?.name ?? ''
  return (
    <Stage>
      <Hero emoji={emoji} title={title} text={text} />
      <PlayerGrid seats={seats} names={nameOf} selected={choice} onSelect={setChoice} />
      <BigButton disabled={choice === null} onClick={() => choice !== null && apply(eliminateSeat(game, choice, cause))}>
        {choice === null ? 'Choisis un joueur' : `Éliminer ${nameOf(choice)}`}
      </BigButton>
    </Stage>
  )
}

function GuessStep({ game, seat }: { game: Game; seat: number }) {
  const apply = useGameStore((s) => s.apply)
  const [guess, setGuess] = useState('')
  const name = game.players[seat]?.name
  return (
    <Stage>
      <Hero emoji="🧳" title={`${name} était un Touriste !`} text="Dernière chance : quel est le mot des civils ? S’il trouve, il gagne tout seul." />
      <input
        aria-label="Mot des civils"
        placeholder="Le mot des civils"
        value={guess}
        enterKeyHint="done"
        onChange={(e) => setGuess(e.target.value.slice(0, 40))}
        className="w-full rounded-card border border-line bg-surface-2 px-4 py-4 text-center text-[22px] font-semibold outline-none focus:border-white/25"
      />
      <BigButton disabled={!guess.trim()} onClick={() => apply(guessWord(game, guess))}>
        Valider
      </BigButton>
    </Stage>
  )
}
