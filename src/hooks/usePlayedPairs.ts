import { useSharedRef } from '../lib/household'
import { playedFromDoc } from '../lib/game/played'
import { useGameStore } from '../lib/game/store'
import { useSharedDoc } from './useSharedDoc'

export function usePlayedPairs(): string[] {
  const { items } = useSharedDoc(useSharedRef('imposteur'), playedFromDoc)
  const session = useGameStore((s) => s.recent)
  return [...new Set([...items, ...session])]
}
