export type Camp = 'civil' | 'imposteur' | 'touriste'
export type PowerId = 'juge' | 'tourtereaux' | 'mime' | 'rancuniere' | 'rivaux' | 'revenant' | 'boomerang' | 'bouffon'
export type Difficulty = 'facile' | 'moyen' | 'difficile'
export type TieRule = 'aucun' | 'revote' | 'hasard'
export type Cause = 'vote' | 'juge' | 'amour' | 'vengeance'
export type Phase = 'reveal' | 'describe' | 'discuss' | 'vote' | 'tie' | 'resolve' | 'summary' | 'end'

export interface WordPair {
  id: string
  category: string
  subcategory: string
  difficulty: Difficulty
  word_civil: string
  word_undercover: string
  similarity: number
  tags: string[]
  enabled: boolean
}

export interface Rewards {
  civil: number
  imposteur: number
  touriste: number
  duel: number
  bouffon: number
}

export interface Settings {
  players: number
  auto: boolean
  counts: Record<Camp, number>
  powers: PowerId[]
  categories: string[]
  difficulties: Difficulty[]
  manual: { civil: string; imposteur: string } | null
  timer: number
  tieRule: TieRule
  rewards: Rewards
}

export interface Player {
  seat: number
  name: string
  camp: Camp
  powers: PowerId[]
  alive: boolean
  ghost: boolean
  out: { round: number; cause: Cause } | null
  votes: number
}

export type Pending = { kind: 'guess'; seat: number } | { kind: 'revenge'; seat: number } | { kind: 'judge'; seats: number[] }

export interface VoteState {
  candidates: number[]
  voters: number[]
  ballots: Record<number, number>
  attempt: number
}

export interface GameEvent {
  round: number
  text: string
}

export interface Game {
  id: string
  startedAt: number
  settings: Settings
  pair: { id: string | null; category: string; civil: string; imposteur: string }
  players: Player[]
  phase: Phase
  round: number
  revealed: number
  order: number[]
  turn: number
  mime: number | null
  mimed: number[]
  vote: VoteState | null
  tie: number[]
  queue: Pending[]
  events: GameEvent[]
  bonuses: Record<number, number>
  flags: { firstVoteOut: boolean; boomerangUsed: boolean; duelDone: boolean }
  winner: Camp | null
  scores: Record<number, number> | null
}
