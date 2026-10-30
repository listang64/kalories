import { context, draft, settle } from './engine'
import { activePowers } from './powers'
import { pickOne } from './random'
import type { Game } from './types'

export const voters = (game: Game) => game.players.filter((player) => player.alive || player.ghost).map((player) => player.seat)

export function startVote(source: Game, candidates?: number[], attempt = 0): Game {
  const game = draft(source)
  game.vote = {
    candidates: candidates ?? game.players.filter((player) => player.alive).map((player) => player.seat),
    voters: voters(game),
    ballots: {},
    attempt,
  }
  game.tie = []
  game.phase = 'vote'
  return game
}

export const choicesFor = (game: Game, voter: number) => (game.vote?.candidates ?? []).filter((seat) => seat !== voter)

export const nextVoter = (game: Game) => game.vote?.voters.find((seat) => !(seat in game.vote!.ballots)) ?? null

export function castVote(source: Game, voter: number, target: number): Game {
  if (!source.vote || voter in source.vote.ballots || !choicesFor(source, voter).includes(target)) return source
  const game = draft(source)
  game.vote!.ballots[voter] = target
  return nextVoter(game) === null ? resolveVote(game) : game
}

function resolveVote(game: Game): Game {
  const vote = game.vote!
  const ctx = context(game)
  const tally = new Map(vote.candidates.map((seat) => [seat, 0]))
  for (const target of Object.values(vote.ballots)) {
    tally.set(target, (tally.get(target) ?? 0) + 1)
    const player = game.players[target]
    if (player) player.votes += 1
  }
  activePowers(game).forEach((power) => power.onTally?.(ctx, tally))
  const top = Math.max(...tally.values())
  const leaders = [...tally].filter(([, count]) => count === top).map(([seat]) => seat)
  if (leaders.length === 1) {
    ctx.eliminate(leaders[0] as number, 'vote')
    return settle(game)
  }
  return breakTie(game, leaders)
}

function breakTie(game: Game, leaders: number[]): Game {
  const ctx = context(game)
  const attempt = game.vote?.attempt ?? 0
  const names = leaders.map((seat) => game.players[seat]?.name).join(', ')
  ctx.log(`Égalité entre ${names}.`)
  if (attempt === 0 || (attempt === 1 && game.settings.tieRule === 'revote' && !hasJudge(game))) {
    game.tie = leaders
    game.phase = 'tie'
    return game
  }
  if (hasJudge(game)) {
    ctx.enqueue({ kind: 'judge', seats: leaders })
    return settle(game)
  }
  if (game.settings.tieRule === 'aucun') {
    ctx.log('Personne n’est éliminé cette manche.')
    return settle(game)
  }
  ctx.log('Le hasard tranche.')
  ctx.eliminate(pickOne(leaders) as number, 'vote')
  return settle(game)
}

export const hasJudge = (game: Game) =>
  game.settings.powers.includes('juge') && game.players.some((player) => player.powers.includes('juge'))

export const judgeOf = (game: Game) => game.players.find((player) => player.powers.includes('juge')) ?? null

export const revote = (game: Game) => startVote(game, game.tie, (game.vote?.attempt ?? 0) + 1)
