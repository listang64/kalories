import { CAMPS } from './camps'
import type { Camp, Game, Rewards } from './types'

export const DEFAULT_REWARDS: Rewards = { civil: 2, imposteur: 10, touriste: 6, duel: 2, bouffon: 4 }

export interface BoardEntry {
  name: string
  games: number
  wins: number
  points: number
}

export interface HistoryEntry {
  id: string
  at: number
  winner: Camp
  civil: string
  imposteur: string
  category: string
  rounds: number
  players: { name: string; camp: Camp; points: number; won: boolean }[]
}

const keyOf = (name: string) => name.trim().toLowerCase()

export function recordGame(board: BoardEntry[], game: Game): BoardEntry[] {
  const next = board.map((entry) => ({ ...entry }))
  for (const player of game.players) {
    const won = player.camp === game.winner
    let entry = next.find((item) => keyOf(item.name) === keyOf(player.name))
    if (!entry) {
      entry = { name: player.name, games: 0, wins: 0, points: 0 }
      next.push(entry)
    }
    entry.games += 1
    entry.wins += won ? 1 : 0
    entry.points += game.scores?.[player.seat] ?? 0
  }
  return next.sort((a, b) => b.points - a.points || b.wins - a.wins || a.name.localeCompare(b.name, 'fr'))
}

export function historyOf(game: Game): HistoryEntry {
  return {
    id: game.id,
    at: Date.now(),
    winner: game.winner ?? 'civil',
    civil: game.pair.civil,
    imposteur: game.pair.imposteur,
    category: game.pair.category,
    rounds: game.round,
    players: game.players.map((player) => ({
      name: player.name,
      camp: player.camp,
      points: game.scores?.[player.seat] ?? 0,
      won: player.camp === game.winner,
    })),
  }
}

export const winnerTitle = (camp: Camp) =>
  camp === 'touriste' ? 'Le Touriste a tout compris !' : `Victoire des ${CAMPS[camp].plural} !`
