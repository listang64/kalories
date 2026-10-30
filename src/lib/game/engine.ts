import { CAMPS } from './camps'
import { activePowers, type PowerContext } from './powers'
import { dealRoles } from './roles'
import type { Camp, Cause, Game, Settings } from './types'
import { sameWord } from './words'

export const draft = (game: Game): Game => structuredClone(game)

export function createGame(settings: Settings, pair: Game['pair'], names: string[]): Game {
  return {
    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    startedAt: Date.now(),
    settings,
    pair,
    players: dealRoles(settings, names),
    phase: 'reveal',
    round: 0,
    revealed: 0,
    order: [],
    turn: 0,
    mime: null,
    mimed: [],
    vote: null,
    tie: [],
    queue: [],
    events: [],
    bonuses: {},
    flags: { firstVoteOut: false, boomerangUsed: false, duelDone: false },
    winner: null,
    scores: null,
  }
}

const CAUSE_TEXT: Record<Cause, string> = {
  vote: 'éliminé par le vote',
  juge: 'désigné par le Juge Marteau',
  amour: 'parti par amour',
  vengeance: 'emporté par la Rancunière',
}

export function context(game: Game): PowerContext {
  const ctx: PowerContext = {
    game,
    eliminate: (seat, cause) => eliminate(ctx, seat, cause),
    enqueue: (pending) => game.queue.push(pending),
    bonus: (seat, points) => (game.bonuses[seat] = (game.bonuses[seat] ?? 0) + points),
    log: (text) => game.events.push({ round: game.round, text }),
  }
  return ctx
}

function eliminate(ctx: PowerContext, seat: number, cause: Cause) {
  const player = ctx.game.players[seat]
  if (!player?.alive) return
  player.alive = false
  player.out = { round: ctx.game.round, cause }
  ctx.log(`${player.name} est ${CAUSE_TEXT[cause]}. C’était un ${CAMPS[player.camp].name} ${CAMPS[player.camp].emoji}`)
  activePowers(ctx.game).forEach((power) => power.onEliminated?.(ctx, player, cause))
  if (player.camp === 'touriste') ctx.enqueue({ kind: 'guess', seat })
  if (cause === 'vote' || cause === 'juge') ctx.game.flags.firstVoteOut = true
}

export function winnerOf(game: Game): Camp | null {
  const alive = game.players.filter((player) => player.alive)
  const count = (camp: Camp) => alive.filter((player) => player.camp === camp).length
  const [civil, imposteur, touriste] = [count('civil'), count('imposteur'), count('touriste')]
  if (imposteur + touriste === 0) return 'civil'
  if (imposteur > 0 && civil <= imposteur) return 'imposteur'
  if (civil === 0) return imposteur > 0 ? 'imposteur' : 'touriste'
  if (imposteur === 0 && alive.length <= 2) return 'touriste'
  return null
}

export function scoresOf(game: Game, winner: Camp): Record<number, number> {
  return Object.fromEntries(
    game.players.map((player) => [
      player.seat,
      (player.camp === winner ? game.settings.rewards[winner] : 0) + (game.bonuses[player.seat] ?? 0),
    ]),
  )
}

function finish(game: Game, winner: Camp) {
  game.winner = winner
  game.scores = scoresOf(game, winner)
  game.phase = 'end'
  game.queue = []
}

export function settle(game: Game): Game {
  if (game.queue.length > 0) {
    game.phase = 'resolve'
    return game
  }
  const winner = winnerOf(game)
  if (winner) finish(game, winner)
  else game.phase = 'summary'
  return game
}

export function eliminateSeat(source: Game, seat: number, cause: Cause): Game {
  const game = draft(source)
  game.queue.shift()
  context(game).eliminate(seat, cause)
  return settle(game)
}

export function guessWord(source: Game, guess: string): Game {
  const game = draft(source)
  const pending = game.queue.shift()
  const player = pending?.kind === 'guess' ? game.players[pending.seat] : undefined
  if (player && sameWord(guess, game.pair.civil)) {
    context(game).log(`🧳 ${player.name} a deviné le mot des civils : « ${game.pair.civil} » !`)
    finish(game, 'touriste')
    return game
  }
  if (player) context(game).log(`🧳 ${player.name} tente « ${guess.trim() || '…'} » : raté !`)
  return settle(game)
}

export function skipPending(source: Game): Game {
  const game = draft(source)
  game.queue.shift()
  return settle(game)
}

export function nameTaken(game: Game, seat: number, name: string): boolean {
  const key = name.trim().toLowerCase()
  return game.players.some((player) => player.seat !== seat && player.seat < game.revealed && player.name.trim().toLowerCase() === key)
}

export function revealDone(source: Game, seat: number, name: string): Game {
  const game = draft(source)
  const player = game.players[seat]
  if (!player) return game
  player.name = name.trim()
  game.revealed = Math.max(game.revealed, seat + 1)
  return game
}
