import { pickOne, randomInt } from './random'
import type { Difficulty, Game, Settings, WordPair } from './types'

export const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: 'facile', label: 'Facile' },
  { value: 'moyen', label: 'Moyen' },
  { value: 'difficile', label: 'Difficile' },
]

let library: Promise<WordPair[]> | null = null

export function loadPairs(): Promise<WordPair[]> {
  library ??= import('../../data/word_pairs.json?raw')
    .then((module) => (JSON.parse(module.default) as { pairs: WordPair[] }).pairs.filter((pair) => pair.enabled))
    .catch((error: unknown) => {
      library = null
      throw error
    })
  return library
}

export function categoriesOf(pairs: WordPair[]): { name: string; count: number }[] {
  const counts = new Map<string, number>()
  pairs.forEach((pair) => counts.set(pair.category, (counts.get(pair.category) ?? 0) + 1))
  return [...counts].map(([name, count]) => ({ name, count }))
}

export function eligiblePairs(pairs: WordPair[], settings: Settings): WordPair[] {
  return pairs.filter(
    (pair) =>
      (settings.categories.length === 0 || settings.categories.includes(pair.category)) &&
      settings.difficulties.includes(pair.difficulty),
  )
}

export interface Draw {
  pair: Game['pair']
  reset: string[]
}

export function choosePair(pairs: WordPair[], settings: Settings, played: string[]): Draw | null {
  if (settings.manual) {
    const { civil, imposteur } = settings.manual
    return { pair: { id: null, category: 'Paire perso', civil: civil.trim(), imposteur: imposteur.trim() }, reset: [] }
  }
  const eligible = eligiblePairs(pairs, settings)
  const seen = new Set(played)
  const fresh = eligible.filter((pair) => !seen.has(pair.id))
  const pair = pickOne(fresh.length ? fresh : eligible)
  if (!pair) return null
  const swap = randomInt(2) === 1
  return {
    pair: {
      id: pair.id,
      category: pair.category,
      civil: swap ? pair.word_undercover : pair.word_civil,
      imposteur: swap ? pair.word_civil : pair.word_undercover,
    },
    reset: fresh.length ? [] : eligible.map((item) => item.id).filter((id) => seen.has(id)),
  }
}

const normalize = (word: string) =>
  word
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\b(le|la|les|un|une|des|l|du|de)\b/g, ' ')
    .replace(/s\b/g, '')
    .replace(/\s+/g, ' ')
    .trim()

export const sameWord = (guess: string, word: string) => normalize(guess) !== '' && normalize(guess) === normalize(word)
