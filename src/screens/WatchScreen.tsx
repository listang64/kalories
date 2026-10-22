import { useState, type FormEvent } from 'react'
import { AnimatePresence } from 'motion/react'
import { DeniedBanner } from '../components/DeniedBanner'
import { FilmIcon } from '../components/icons/FilmIcon'
import { PlusIcon } from '../components/icons/PlusIcon'
import { Segmented } from '../components/Segmented'
import { SuggestionList } from '../components/watch/SuggestionList'
import { TitleSheet } from '../components/watch/TitleSheet'
import { WatchCard } from '../components/watch/WatchCard'
import { useTitleSearch } from '../hooks/useTitleSearch'
import { useWatchlist } from '../hooks/useWatchlist'
import type { Profile } from '../lib/profiles'
import { sharedErrorMessage } from '../lib/shared'
import { addTitle, removeTitle, updateTitle, type ScreenKind, type WatchItem } from '../lib/watchlist'
import { cachedDetails, type TitleHit } from '../lib/wiki'
import { useAppStore } from '../store/appStore'

interface Props {
  me: Profile
  partner: Profile | null
}

const NOUN: Record<ScreenKind, { one: string; many: string; add: string }> = {
  film: { one: 'film', many: 'films', add: 'Chercher un film à voir' },
  serie: { one: 'série', many: 'séries', add: 'Chercher une série à voir' },
}

const sameTitle = (a: string, b: string) => a.localeCompare(b, 'fr', { sensitivity: 'base' }) === 0

export function WatchScreen({ me, partner }: Props) {
  const { items, denied } = useWatchlist()
  const [kind, setKind] = useState<ScreenKind>('film')
  const [text, setText] = useState('')
  const [open, setOpen] = useState<WatchItem | null>(null)
  const search = useTitleSearch(text, kind)
  const showToast = useAppStore((s) => s.showToast)
  const fail = (error: unknown) => showToast(sharedErrorMessage(error))
  const shown = items.filter((item) => item.kind === kind)
  const count = (value: ScreenKind) => items.filter((item) => item.kind === value).length
  const options = (['film', 'serie'] as const).map((value) => ({
    value,
    label: `${value === 'film' ? 'Films' : 'Séries'}${count(value) ? ` · ${count(value)}` : ''}`,
  }))
  const noun = NOUN[kind]
  const taken = (hit: TitleHit) => shown.some((item) => item.ref === hit.ref)

  const pick = (hit: TitleHit) => {
    setText('')
    if (taken(hit)) return showToast(`Déjà dans la liste : ${hit.title}`)
    const { id, saved } = addTitle({ kind, title: hit.title, year: hit.year, ref: hit.ref, poster: '' }, me.uid)
    saved.catch(fail)
    showToast(`Ajouté : ${hit.title}${hit.year ? ` (${hit.year})` : ''}`)
    cachedDetails(hit.ref)
      .then((details) => (details.poster ? updateTitle(id, { poster: details.poster, year: hit.year ?? details.year }) : undefined))
      .catch(() => undefined)
  }

  const addManual = () => {
    const title = text.trim()
    if (!title) return
    setText('')
    if (shown.some((item) => sameTitle(item.title, title))) return showToast(`Déjà dans la liste : ${title}`)
    addTitle({ kind, title, year: null, ref: '', poster: '' }, me.uid).saved.catch(fail)
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (search.loading) return
    const first = search.hits.find((hit) => !taken(hit))
    if (first) pick(first)
    else addManual()
  }

  const remove = (item: WatchItem) => {
    setOpen(null)
    removeTitle(item.id).catch(fail)
    showToast(`Supprimé : ${item.title}`)
  }

  return (
    <div className="flex h-full flex-col">
      <Segmented label="Films ou séries" value={kind} options={options} onChange={setKind} />
      <form
        onSubmit={submit}
        className="mt-3 flex shrink-0 items-center gap-2 rounded-full border border-line bg-surface-2 py-1.5 pr-1.5 pl-4"
      >
        <input
          aria-label={noun.add}
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 100))}
          placeholder={noun.add}
          enterKeyHint="search"
          autoCapitalize="sentences"
          autoCorrect="off"
          className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-text-2"
        />
        <button
          type="submit"
          aria-label={`Ajouter ${noun.one === 'série' ? 'la série' : 'le film'}`}
          disabled={!text.trim()}
          className="press grid size-10 shrink-0 place-items-center rounded-full bg-accent text-black disabled:opacity-35"
        >
          <PlusIcon size={20} strokeWidth={2} />
        </button>
      </form>
      {denied && <DeniedBanner what="aux films et séries" />}
      <div className="-mx-5 mt-5 min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-5 pb-4">
        {text.trim() ? (
          <SuggestionList search={search} text={text} noun={noun.one} taken={taken} onPick={pick} onManual={addManual} />
        ) : shown.length === 0 ? (
          <div className="flex flex-col items-center gap-3 pt-14 text-center">
            <span className="text-text-2">
              <FilmIcon size={40} />
            </span>
            <p className="text-[17px] font-semibold">
              Aucun{kind === 'serie' ? 'e' : ''} {noun.one} à voir
            </p>
            <p className="max-w-64 text-[15px] text-text-2">
              {partner ? `Note ce que vous voulez regarder, ${partner.name} le verra aussi.` : 'Note ce que tu veux regarder.'}
            </p>
          </div>
        ) : (
          <>
            <p className="label mb-3 px-1">
              {shown.length} {shown.length > 1 ? noun.many : noun.one} à voir
            </p>
            <ul className="flex flex-col gap-2.5">
              <AnimatePresence initial={false}>
                {shown.map((item) => (
                  <WatchCard key={item.id} item={item} onOpen={() => setOpen(item)} onDelete={() => remove(item)} />
                ))}
              </AnimatePresence>
            </ul>
          </>
        )}
      </div>
      {!text.trim() && shown.length > 0 && (
        <p className="shrink-0 pt-2 text-center text-[12px] text-text-2">
          Touche un titre pour sa fiche · glisse-le à gauche pour le supprimer
        </p>
      )}
      <TitleSheet item={open} onClose={() => setOpen(null)} onDelete={remove} />
    </div>
  )
}
