import type { ScreenKind } from './watchlist'

export interface TitleHit {
  ref: string
  title: string
  description: string
  year: number | null
}

export interface TitleDetails extends TitleHit {
  kind: ScreenKind
  poster: string
  synopsis: string
  cast: string[]
  makers: string[]
  runtime: number | null
  seasons: number | null
  url: string
}

interface Snak {
  mainsnak?: { datavalue?: { value?: unknown } }
}

interface Entity {
  labels?: Record<string, { value: string }>
  descriptions?: Record<string, { value: string }>
  claims?: Record<string, Snak[]>
  sitelinks?: Record<string, { title: string }>
}

interface Page {
  title: string
  index?: number
  extract?: string
  thumbnail?: { source: string }
  entityterms?: { label?: string[]; description?: string[] }
}

interface Api {
  search?: { id: string; label?: string; description?: string }[]
  query?: { pages?: Page[] }
  entities?: Record<string, Entity>
}

const WIKIDATA = 'https://www.wikidata.org/w/api.php'
const FRWIKI = 'https://fr.wikipedia.org/w/api.php'
const ENWIKI = 'https://en.wikipedia.org/w/api.php'
const TVMAZE = 'https://api.tvmaze.com'
const POSTER_WIDTH = '342'
const SYNOPSIS_MAX = 1400

const CLASSES: Record<ScreenKind, string[]> = {
  film: ['Q11424', 'Q202866', 'Q24869', 'Q506240', 'Q93204'],
  serie: ['Q5398426', 'Q1259759', 'Q581714', 'Q117467246', 'Q526877', 'Q63952888'],
}

const DESCRIPTION: Record<ScreenKind, RegExp> = {
  film: /^((télé|court[- ]|long[- ]|moyen[- ])?(film|métrage)|(film )?documentaire)(?![a-zà-ÿ])/i,
  serie: /^((mini-?)?séries? (télévisée|d['’]animation|animée|de télévision|web)|feuilleton|sitcom|websérie|anime)(?![a-zà-ÿ])/i,
}

const SECTION = /^==\s*(Synopsis|Résumé|Intrigue|Histoire|Scénario)\s*==\s*$/i

export class WikiError extends Error {}

async function api(base: string, params: Record<string, string>, signal?: AbortSignal): Promise<Api> {
  const query = new URLSearchParams({ format: 'json', formatversion: '2', origin: '*', ...params })
  const response = await fetch(`${base}?${query}`, { signal })
  if (response.status === 429) throw new WikiError('Wikipédia est surchargé, réessaie dans un instant')
  if (!response.ok) throw new WikiError('Wikipédia ne répond pas')
  return (await response.json()) as Api
}

const yearOf = (text: string) => {
  const match = /\b(18|19|20)\d{2}\b/.exec(text)
  return match ? Number(match[0]) : null
}

const hit = (ref: string, title: string | undefined, description = ''): TitleHit | null =>
  title ? { ref, title, description, year: yearOf(description) } : null

async function prefixSearch(text: string, kind: ScreenKind, signal?: AbortSignal): Promise<TitleHit[]> {
  const data = await api(WIKIDATA, { action: 'wbsearchentities', search: text, language: 'fr', uselang: 'fr', type: 'item', limit: '50' }, signal)
  return (data.search ?? [])
    .filter((item) => DESCRIPTION[kind].test(item.description ?? ''))
    .map((item) => hit(item.id, item.label, item.description))
    .filter((item): item is TitleHit => item !== null)
}

async function wordSearch(text: string, kind: ScreenKind, signal?: AbortSignal): Promise<TitleHit[]> {
  const words = text.split(/\s+/).map((word) => word.replace(/[^\p{L}\p{N}'’-]/gu, '')).filter((word) => word.length > 1)
  if (words.length === 0) return []
  const filter = CLASSES[kind].map((id) => `P31=${id}`).join('|')
  const data = await api(
    WIKIDATA,
    {
      action: 'query',
      generator: 'search',
      gsrnamespace: '0',
      gsrlimit: '12',
      gsrsearch: `${words.map((word) => `inlabel:${word}@fr`).join(' ')} haswbstatement:${filter}`,
      prop: 'entityterms',
      wbetterms: 'label|description',
      wbetlanguage: 'fr',
    },
    signal,
  )
  return (data.query?.pages ?? [])
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
    .map((page) => hit(page.title, page.entityterms?.label?.[0], page.entityterms?.description?.[0]))
    .filter((item): item is TitleHit => item !== null)
}

export async function searchTitles(text: string, kind: ScreenKind, signal?: AbortSignal): Promise<TitleHit[]> {
  const query = text.trim()
  if (query.length < 2) return []
  const results = await Promise.allSettled([prefixSearch(query, kind, signal), wordSearch(query, kind, signal)])
  const found = results.flatMap((result) => (result.status === 'fulfilled' ? result.value : []))
  const failure = results.find((result) => result.status === 'rejected')
  if (found.length === 0 && failure?.status === 'rejected') throw failure.reason
  const seen = new Set<string>()
  return found.filter((item) => !seen.has(item.ref) && seen.add(item.ref)).slice(0, 8)
}

const values = (claims: Record<string, Snak[]>, property: string) =>
  (claims[property] ?? []).map((snak) => snak.mainsnak?.datavalue?.value)

const ids = (claims: Record<string, Snak[]>, property: string) =>
  values(claims, property)
    .map((value) => (typeof value === 'object' && value !== null && 'id' in value ? String(value.id) : ''))
    .filter(Boolean)

const amount = (claims: Record<string, Snak[]>, property: string) => {
  const value = values(claims, property)[0]
  const number = typeof value === 'object' && value !== null && 'amount' in value ? Number(value.amount) : NaN
  return Number.isFinite(number) && number > 0 ? Math.round(number) : null
}

const firstYear = (claims: Record<string, Snak[]>, property: string) => {
  const years = values(claims, property)
    .map((value) => (typeof value === 'object' && value !== null && 'time' in value ? Number(String(value.time).slice(1, 5)) : NaN))
    .filter((year) => Number.isFinite(year) && year > 1800)
  return years.length ? Math.min(...years) : null
}

async function entity(ref: string, signal?: AbortSignal): Promise<Entity> {
  const data = await api(
    WIKIDATA,
    { action: 'wbgetentities', ids: ref, props: 'labels|descriptions|claims|sitelinks', languages: 'fr|en', sitefilter: 'frwiki|enwiki' },
    signal,
  )
  const found = data.entities?.[ref]
  if (!found?.claims) throw new WikiError('Fiche introuvable sur Wikipédia')
  return found
}

async function labels(refs: string[], signal?: AbortSignal): Promise<Record<string, string>> {
  if (refs.length === 0) return {}
  const data = await api(WIKIDATA, { action: 'wbgetentities', ids: refs.join('|'), props: 'labels', languages: 'fr', languagefallback: '1' }, signal)
  return Object.fromEntries(Object.entries(data.entities ?? {}).map(([id, item]) => [id, item.labels?.fr?.value ?? '']))
}

function excerpt(text: string): string {
  const lines = text.split('\n')
  const start = lines.findIndex((line) => SECTION.test(line))
  const from = start >= 0 ? start + 1 : 0
  const end = lines.findIndex((line, index) => index >= from && /^==[^=]/.test(line))
  const body = lines
    .slice(from, end >= 0 ? end : undefined)
    .filter((line) => !line.startsWith('='))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  if (body.length <= SYNOPSIS_MAX) return body
  const cut = body.slice(0, SYNOPSIS_MAX)
  return `${cut.slice(0, Math.max(cut.lastIndexOf('. ') + 1, SYNOPSIS_MAX * 0.6))} …`
}

async function synopsis(title: string, signal?: AbortSignal): Promise<string> {
  const data = await api(FRWIKI, { action: 'query', prop: 'extracts', explaintext: '1', exsectionformat: 'wiki', redirects: '1', titles: title }, signal)
  return excerpt(data.query?.pages?.[0]?.extract ?? '')
}

async function pageImage(base: string, title: string, signal?: AbortSignal): Promise<string> {
  const data = await api(
    base,
    { action: 'query', prop: 'pageimages', piprop: 'thumbnail', pithumbsize: POSTER_WIDTH, pilicense: 'any', redirects: '1', titles: title },
    signal,
  )
  return data.query?.pages?.[0]?.thumbnail?.source.split('?')[0] ?? ''
}

interface Show {
  poster: string
  cast: string[]
}

async function tvmaze(imdb: string, withCast: boolean, signal?: AbortSignal): Promise<Show> {
  const response = await fetch(`${TVMAZE}/lookup/shows?imdb=${encodeURIComponent(imdb)}`, { signal })
  if (!response.ok) return { poster: '', cast: [] }
  const show = (await response.json()) as { id?: number; image?: { medium?: string } | null }
  if (!withCast || !show.id) return { poster: show.image?.medium ?? '', cast: [] }
  const people = await fetch(`${TVMAZE}/shows/${show.id}/cast`, { signal })
  const cast = people.ok ? ((await people.json()) as { person?: { name?: string } }[]) : []
  return { poster: show.image?.medium ?? '', cast: cast.map((entry) => entry.person?.name ?? '').filter(Boolean).slice(0, 10) }
}

const optional = <T>(promise: Promise<T>, fallback: T) => promise.catch(() => fallback)

export async function titleDetails(ref: string, signal?: AbortSignal): Promise<TitleDetails> {
  const item = await entity(ref, signal)
  const claims = item.claims ?? {}
  const kind: ScreenKind = ids(claims, 'P31').some((id) => CLASSES.serie.includes(id)) ? 'serie' : 'film'
  const castIds = ids(claims, 'P161').slice(0, 10)
  const makerIds = (kind === 'serie' && ids(claims, 'P170').length ? ids(claims, 'P170') : ids(claims, 'P57')).slice(0, 3)
  const fr = item.sitelinks?.frwiki?.title
  const en = item.sitelinks?.enwiki?.title
  const [names, text, enPoster] = await Promise.all([
    optional(labels([...castIds, ...makerIds], signal), {} as Record<string, string>),
    fr ? optional(synopsis(fr, signal), '') : Promise.resolve(''),
    en ? optional(pageImage(ENWIKI, en, signal), '') : Promise.resolve(''),
  ])
  let cast = castIds.map((id) => names[id] ?? '').filter(Boolean)
  let poster = enPoster
  const imdb = values(claims, 'P345').find((value): value is string => typeof value === 'string')
  if (kind === 'serie' && imdb && (!poster || cast.length === 0)) {
    const show = await optional(tvmaze(imdb, cast.length === 0, signal), { poster: '', cast: [] })
    poster ||= show.poster
    if (cast.length === 0) cast = show.cast
  }
  if (!poster && fr) poster = await optional(pageImage(FRWIKI, fr, signal), '')
  const description = item.descriptions?.fr?.value ?? ''
  return {
    ref,
    kind,
    title: item.labels?.fr?.value ?? item.labels?.en?.value ?? fr ?? en ?? '',
    description,
    year: firstYear(claims, 'P577') ?? firstYear(claims, 'P580') ?? yearOf(description),
    poster,
    synopsis: text,
    cast,
    makers: makerIds.map((id) => names[id] ?? '').filter(Boolean),
    runtime: amount(claims, 'P2047'),
    seasons: amount(claims, 'P2437'),
    url: fr ? `https://fr.wikipedia.org/wiki/${encodeURIComponent(fr.replace(/ /g, '_'))}` : `https://www.wikidata.org/wiki/${ref}`,
  }
}

const details = new Map<string, Promise<TitleDetails>>()

export function cachedDetails(ref: string): Promise<TitleDetails> {
  const known = details.get(ref)
  if (known) return known
  const pending = titleDetails(ref)
  details.set(ref, pending)
  pending.catch(() => details.delete(ref))
  return pending
}
