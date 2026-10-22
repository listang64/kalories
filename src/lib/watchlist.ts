import { deleteField, setDoc, updateDoc, type DocumentSnapshot } from 'firebase/firestore'
import { currentSharedDoc } from './household'
import { newId } from './shared'

export type ScreenKind = 'film' | 'serie'

export interface TitleInput {
  kind: ScreenKind
  title: string
  year: number | null
  ref: string
  poster: string
}

export interface WatchItem extends TitleInput {
  id: string
  addedBy: string
  order: number
}

const MAX_TITLE = 100
const MAX_URL = 600

function clean(input: TitleInput): TitleInput {
  return {
    kind: input.kind,
    title: input.title.trim().slice(0, MAX_TITLE),
    year: input.year,
    ref: input.ref.slice(0, 80),
    poster: input.poster.startsWith('https://') ? input.poster.slice(0, MAX_URL) : '',
  }
}

export async function addTitle(input: TitleInput, uid: string): Promise<void> {
  const item = { ...clean(input), addedBy: uid, order: Date.now() }
  await setDoc(currentSharedDoc('ecrans'), { titles: { [newId()]: item } }, { merge: true })
}

export async function removeTitle(id: string): Promise<void> {
  await updateDoc(currentSharedDoc('ecrans'), { [`titles.${id}`]: deleteField() })
}

function parseTitle(id: string, value: unknown): WatchItem | null {
  if (typeof value !== 'object' || value === null) return null
  const data = value as Record<string, unknown>
  if (typeof data.title !== 'string' || !data.title) return null
  return {
    id,
    kind: data.kind === 'serie' ? 'serie' : 'film',
    title: data.title,
    year: typeof data.year === 'number' ? data.year : null,
    ref: typeof data.ref === 'string' ? data.ref : '',
    poster: typeof data.poster === 'string' ? data.poster : '',
    addedBy: typeof data.addedBy === 'string' ? data.addedBy : '',
    order: typeof data.order === 'number' ? data.order : 0,
  }
}

export function titlesFromDoc(snapshot: DocumentSnapshot): WatchItem[] {
  const titles: unknown = snapshot.get('titles')
  if (typeof titles !== 'object' || titles === null) return []
  return Object.entries(titles)
    .map(([id, value]) => parseTitle(id, value))
    .filter((item): item is WatchItem => item !== null)
    .sort((a, b) => b.order - a.order)
}
