import { useEffect, useState } from 'react'
import { updateTitle, type WatchItem } from '../lib/watchlist'
import { cachedDetails, searchTitles, WikiError, type TitleDetails } from '../lib/wiki'

export type DetailsState =
  | { status: 'loading' }
  | { status: 'ready'; details: TitleDetails }
  | { status: 'error'; message: string }

const LOADING: DetailsState = { status: 'loading' }

const sameTitle = (a: string, b: string) => a.localeCompare(b, 'fr', { sensitivity: 'base' }) === 0

async function resolve(item: WatchItem): Promise<string> {
  if (item.ref) return item.ref
  const hits = await searchTitles(item.title, item.kind)
  const ref = (hits.find((hit) => sameTitle(hit.title, item.title)) ?? hits[0])?.ref
  if (!ref) throw new WikiError(`Aucune fiche trouvée pour « ${item.title} »`)
  return ref
}

export function useTitleDetails(item: WatchItem | null) {
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState<{ key: string; result: DetailsState }>({ key: '', result: LOADING })
  const key = item ? `${item.id}:${attempt}` : ''

  useEffect(() => {
    if (!item) return
    let alive = true
    resolve(item)
      .then(cachedDetails)
      .then((details) => {
        if (!alive) return
        setState({ key, result: { status: 'ready', details } })
        const patch = {
          ...(item.ref ? {} : { ref: details.ref }),
          ...(!item.poster && details.poster ? { poster: details.poster } : {}),
          ...(item.year === null && details.year ? { year: details.year } : {}),
        }
        if (Object.keys(patch).length) updateTitle(item.id, patch).catch(() => undefined)
      })
      .catch((error: unknown) => {
        if (!alive) return
        const message = error instanceof WikiError ? error.message : 'Pas de connexion à Wikipédia'
        setState({ key, result: { status: 'error', message } })
      })
    return () => {
      alive = false
    }
  }, [key])

  return { state: state.key === key ? state.result : LOADING, retry: () => setAttempt((n) => n + 1) }
}
