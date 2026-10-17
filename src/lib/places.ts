import { create } from 'zustand'

export interface Place {
  id: string
  name: string
  region: string
  latitude: number
  longitude: number
}

export const DEFAULT_PLACE: Place = {
  id: 'hasparren',
  name: 'Hasparren',
  region: 'Pyrénées-Atlantiques',
  latitude: 43.3842,
  longitude: -1.3053,
}

const STORAGE = 'kalories.places'
const SEARCH = 'https://geocoding-api.open-meteo.com/v1/search'

interface Stored {
  places: Place[]
  activeId: string
}

function isPlace(value: unknown): value is Place {
  const p = value as Partial<Place> | null
  return typeof p?.id === 'string' && typeof p.name === 'string' && typeof p.latitude === 'number' && typeof p.longitude === 'number'
}

function load(): Stored {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE) ?? 'null') as Partial<Stored> | null
    const places = Array.isArray(stored?.places) ? stored.places.filter(isPlace) : []
    if (places.length === 0) return { places: [DEFAULT_PLACE], activeId: DEFAULT_PLACE.id }
    const activeId = places.some((p) => p.id === stored?.activeId) ? (stored?.activeId ?? '') : (places[0]?.id ?? '')
    return { places, activeId }
  } catch {
    return { places: [DEFAULT_PLACE], activeId: DEFAULT_PLACE.id }
  }
}

function save(stored: Stored) {
  try {
    localStorage.setItem(STORAGE, JSON.stringify(stored))
  } catch {
    return
  }
}

function samePlace(a: Place, b: Place): boolean {
  return a.id === b.id || (Math.abs(a.latitude - b.latitude) < 0.01 && Math.abs(a.longitude - b.longitude) < 0.01)
}

interface PlacesState extends Stored {
  addPlace: (place: Place) => Place
  removePlace: (id: string) => void
  setActive: (id: string) => void
}

export const usePlaces = create<PlacesState>()((set, get) => {
  const commit = (next: Stored) => {
    save(next)
    set(next)
  }
  return {
    ...load(),
    addPlace: (place) => {
      const { places, activeId } = get()
      const existing = places.find((p) => samePlace(p, place))
      if (!existing) commit({ places: [...places, place], activeId })
      return existing ?? place
    },
    removePlace: (id) => {
      const { places, activeId } = get()
      if (id === activeId || places.length < 2) return
      commit({ places: places.filter((p) => p.id !== id), activeId })
    },
    setActive: (activeId) => commit({ places: get().places, activeId }),
  }
})

export function useActivePlace(): Place {
  return usePlaces((s) => s.places.find((p) => p.id === s.activeId) ?? s.places[0] ?? DEFAULT_PLACE)
}

interface GeoResult {
  id?: number
  name?: string
  latitude?: number
  longitude?: number
  country?: string
  admin1?: string
  admin2?: string
}

export interface PlaceResult extends Place {
  country: string
}

export async function searchPlaces(query: string, signal: AbortSignal): Promise<PlaceResult[]> {
  const params = new URLSearchParams({ name: query.trim(), count: '6', language: 'fr', format: 'json' })
  const response = await fetch(`${SEARCH}?${params}`, { signal })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const { results } = (await response.json()) as { results?: GeoResult[] }
  return (results ?? []).flatMap((r) =>
    r.id !== undefined && r.name && typeof r.latitude === 'number' && typeof r.longitude === 'number'
      ? [
          {
            id: String(r.id),
            name: r.name,
            region: r.admin2 || r.admin1 || r.country || '',
            country: r.country ?? '',
            latitude: r.latitude,
            longitude: r.longitude,
          },
        ]
      : [],
  )
}
