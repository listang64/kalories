import { create } from 'zustand'
import { defaultCounts } from './roles'
import { DEFAULT_REWARDS, historyOf, recordGame, type BoardEntry, type HistoryEntry } from './scoring'
import { readSession, writeSession } from './storage'
import type { Game, Settings } from './types'
import { markPlayed } from './played'
import type { Draw } from './words'

interface Saved {
  game: Game | null
  settings: Settings
  board: BoardEntry[]
  history: HistoryEntry[]
  recent: string[]
  names: string[]
}

interface GameStore extends Saved {
  setSettings: (patch: Partial<Settings>) => void
  apply: (game: Game) => void
  deal: (draw: Draw, game: Game) => void
  abandon: () => void
  resetBoard: () => void
}

export const DEFAULT_SETTINGS: Settings = {
  players: 5,
  auto: true,
  counts: defaultCounts(5),
  powers: [],
  categories: [],
  difficulties: ['facile', 'moyen', 'difficile'],
  manual: null,
  timer: 120,
  tieRule: 'revote',
  rewards: DEFAULT_REWARDS,
}

const saved = readSession<Saved>({ game: null, settings: DEFAULT_SETTINGS, board: [], history: [], recent: [], names: [] })

export const useGameStore = create<GameStore>((set) => ({
  ...saved,
  setSettings: (patch) => set((state) => ({ settings: { ...state.settings, ...patch } })),
  apply: (game) =>
    set((state) => {
      if (game.phase !== 'end' || state.game?.phase === 'end') return { game }
      return {
        game,
        board: recordGame(state.board, game),
        history: [historyOf(game), ...state.history],
        names: game.players.map((player) => player.name),
      }
    }),
  deal: ({ pair, reset }, game) => {
    if (pair.id) markPlayed(pair.id, reset).catch(() => undefined)
    set((state) => ({
      game,
      recent: pair.id ? [...state.recent.filter((id) => !reset.includes(id)), pair.id] : state.recent,
    }))
  },
  abandon: () => set({ game: null }),
  resetBoard: () => set({ board: [], history: [] }),
}))

useGameStore.subscribe(({ game, settings, board, history, recent, names }) =>
  writeSession({ game, settings, board, history, recent, names }),
)
