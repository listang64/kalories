import { useSharedRef } from '../lib/household'
import { titlesFromDoc } from '../lib/watchlist'
import { useSharedDoc } from './useSharedDoc'

export function useWatchlist() {
  return useSharedDoc(useSharedRef('ecrans'), titlesFromDoc)
}
