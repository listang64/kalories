import { draft } from './engine'
import { activePowers } from './powers'
import { pickOne } from './random'
import type { Game } from './types'

export function startRound(source: Game): Game {
  const game = draft(source)
  game.round += 1
  game.turn = 0
  game.vote = null
  game.tie = []
  game.mime = null
  const alive = game.players.filter((player) => player.alive).map((player) => player.seat)
  const starters = alive.filter((seat) => game.players[seat]?.camp !== 'touriste')
  const first = pickOne(starters.length ? starters : alive) ?? 0
  const at = alive.indexOf(first)
  game.order = [...alive.slice(at), ...alive.slice(0, at)]
  activePowers(game).forEach((power) => power.onRoundStart?.(game))
  game.phase = 'describe'
  return game
}

export function nextSpeaker(source: Game): Game {
  const game = draft(source)
  if (game.turn + 1 < game.order.length) game.turn += 1
  else game.phase = 'discuss'
  return game
}

export const roundEvents = (game: Game) => game.events.filter((event) => event.round === game.round)
