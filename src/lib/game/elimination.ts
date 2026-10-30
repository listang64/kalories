import { context, draft, settle } from './engine'
import { activePowers } from './powers'
import type { Game } from './types'

export const hasJudge = (game: Game) =>
  game.settings.powers.includes('juge') && game.players.some((player) => player.powers.includes('juge'))

export const judgeOf = (game: Game) => game.players.find((player) => player.powers.includes('juge')) ?? null

export function designate(source: Game, seat: number, cause: 'vote' | 'juge'): Game {
  const game = draft(source)
  const ctx = context(game)
  const target = game.players[seat]
  if (!target?.alive) return source
  if (activePowers(game).some((power) => power.onDesignate?.(ctx, target))) return game
  ctx.eliminate(seat, cause)
  return settle(game)
}

export function spare(source: Game): Game {
  const game = draft(source)
  context(game).log('Personne n’est éliminé cette manche.')
  return settle(game)
}
