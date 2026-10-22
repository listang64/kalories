import { useEffect, useState } from 'react'
import type { ScreenKind } from '../lib/watchlist'
import { searchTitles, WikiError, type TitleHit } from '../lib/wiki'

export interface TitleSearch {
  loading: boolean
  hits: TitleHit[]
  error: string
}

const DELAY = 350
const IDLE: TitleSearch = { loading: false, hits: [], error: '' }

export function useTitleSearch(text: string, kind: ScreenKind): TitleSearch {
  const query = text.trim()
  const key = `${kind}:${query.toLocaleLowerCase('fr')}`
  const [state, setState] = useState<{ key: string; result: TitleSearch }>({ key: '', result: IDLE })

  useEffect(() => {
    if (query.length < 2) return
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      searchTitles(query, kind, controller.signal)
        .then((hits) => setState({ key, result: { loading: false, hits, error: '' } }))
        .catch((error: unknown) => {
          if (controller.signal.aborted) return
          const message = error instanceof WikiError ? error.message : 'Wikipédia ne répond pas pour l’instant, réessaie'
          setState({ key, result: { loading: false, hits: [], error: message } })
        })
    }, DELAY)
    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [key, query, kind])

  if (query.length < 2) return IDLE
  return state.key === key ? state.result : { loading: true, hits: state.result.hits, error: '' }
}
