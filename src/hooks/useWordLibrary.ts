import { useEffect, useState } from 'react'
import type { WordPair } from '../lib/game/types'
import { loadPairs } from '../lib/game/words'

export function useWordLibrary() {
  const [pairs, setPairs] = useState<WordPair[] | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let alive = true
    loadPairs()
      .then((list) => alive && setPairs(list))
      .catch(() => alive && setFailed(true))
    return () => {
      alive = false
    }
  }, [])

  return { pairs, failed }
}
