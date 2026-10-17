import { useEffect, useState } from 'react'
import { searchPlaces, type Place, type PlaceResult } from '../../lib/places'
import { SearchIcon } from '../icons/SearchIcon'

type Status = 'idle' | 'loading' | 'empty' | 'error'

const DELAY = 300

export function SearchPanel({ onAdd }: { onAdd: (place: Place) => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PlaceResult[]>([])
  const [status, setStatus] = useState<Status>('idle')

  useEffect(() => {
    const text = query.trim()
    if (text.length < 2) {
      setResults([])
      setStatus('idle')
      return
    }
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      setStatus('loading')
      searchPlaces(text, controller.signal)
        .then((found) => {
          setResults(found)
          setStatus(found.length > 0 ? 'idle' : 'empty')
        })
        .catch(() => !controller.signal.aborted && setStatus('error'))
    }, DELAY)
    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  const pick = (place: PlaceResult) => {
    onAdd({ id: place.id, name: place.name, region: place.region, latitude: place.latitude, longitude: place.longitude })
    setQuery('')
  }

  return (
    <section aria-label="Ajouter une ville" className="flex h-full w-full shrink-0 snap-center flex-col px-7">
      <label className="flex h-12 shrink-0 items-center gap-2.5 rounded-full border border-line bg-black/30 px-4 focus-within:border-white/20">
        <span className="text-accent">
          <SearchIcon size={20} />
        </span>
        <input
          aria-label="Chercher une ville"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Chercher une ville"
          enterKeyHint="search"
          autoCapitalize="words"
          autoCorrect="off"
          className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-text-2"
        />
      </label>
      {results.length > 0 ? (
        <ul className="mt-3 min-h-0 flex-1 overflow-y-auto">
          {results.map((place) => (
            <li key={place.id}>
              <button
                type="button"
                onClick={() => pick(place)}
                className="flex w-full flex-col items-start rounded-[12px] px-3 py-2.5 text-left active:bg-white/8"
              >
                <span className="text-[17px] font-semibold">{place.name}</span>
                <span className="text-[13px] text-text-2">
                  {[place.region, place.country].filter((part, i, all) => part && all.indexOf(part) === i).join(', ')}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center text-text-2">
          <SearchIcon size={40} strokeWidth={1.5} />
          <p className="text-[15px]">
            {status === 'loading' && 'Recherche…'}
            {status === 'empty' && 'Aucune ville trouvée'}
            {status === 'error' && 'Recherche impossible pour l’instant'}
            {status === 'idle' && 'Cherche une ville pour ajouter son panneau météo'}
          </p>
        </div>
      )}
    </section>
  )
}
