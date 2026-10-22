import { useState, type FormEvent } from 'react'
import { AnimatePresence } from 'motion/react'
import { DeniedBanner } from '../components/DeniedBanner'
import { FilmIcon } from '../components/icons/FilmIcon'
import { PlusIcon } from '../components/icons/PlusIcon'
import { Segmented } from '../components/Segmented'
import { WatchCard } from '../components/watch/WatchCard'
import { useWatchlist } from '../hooks/useWatchlist'
import type { Profile } from '../lib/profiles'
import { sharedErrorMessage } from '../lib/shared'
import { addTitle, removeTitle, type ScreenKind, type WatchItem } from '../lib/watchlist'
import { useAppStore } from '../store/appStore'

interface Props {
  me: Profile
  partner: Profile | null
}

const NOUN: Record<ScreenKind, { one: string; many: string; add: string }> = {
  film: { one: 'film', many: 'films', add: 'Ajouter un film à voir' },
  serie: { one: 'série', many: 'séries', add: 'Ajouter une série à voir' },
}

const sameTitle = (a: string, b: string) => a.localeCompare(b, 'fr', { sensitivity: 'base' }) === 0

export function WatchScreen({ me, partner }: Props) {
  const { items, denied } = useWatchlist()
  const [kind, setKind] = useState<ScreenKind>('film')
  const [text, setText] = useState('')
  const showToast = useAppStore((s) => s.showToast)
  const fail = (error: unknown) => showToast(sharedErrorMessage(error))
  const shown = items.filter((item) => item.kind === kind)
  const count = (value: ScreenKind) => items.filter((item) => item.kind === value).length
  const options = (['film', 'serie'] as const).map((value) => ({
    value,
    label: `${value === 'film' ? 'Films' : 'Séries'}${count(value) ? ` · ${count(value)}` : ''}`,
  }))
  const noun = NOUN[kind]

  const add = (event: FormEvent) => {
    event.preventDefault()
    const title = text.trim()
    if (!title) return
    setText('')
    if (shown.some((item) => sameTitle(item.title, title))) return showToast(`Déjà dans la liste : ${title}`)
    addTitle({ kind, title, year: null, ref: '', poster: '' }, me.uid).catch(fail)
  }

  const seen = (item: WatchItem) => {
    removeTitle(item.id).catch(fail)
    showToast(`Vu : ${item.title}`)
  }

  return (
    <div className="flex h-full flex-col">
      <Segmented label="Films ou séries" value={kind} options={options} onChange={setKind} />
      <form
        onSubmit={add}
        className="mt-3 flex shrink-0 items-center gap-2 rounded-full border border-line bg-surface-2 py-1.5 pr-1.5 pl-4"
      >
        <input
          aria-label={noun.add}
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 100))}
          placeholder={noun.add}
          enterKeyHint="send"
          autoCapitalize="sentences"
          className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-text-2"
        />
        <button
          type="submit"
          aria-label={noun.add}
          disabled={!text.trim()}
          className="press grid size-10 shrink-0 place-items-center rounded-full bg-accent text-black disabled:opacity-35"
        >
          <PlusIcon size={20} strokeWidth={2} />
        </button>
      </form>
      {denied && <DeniedBanner what="aux films et séries" />}
      <p className="label mt-5 h-4 shrink-0 px-1">
        {shown.length > 0 && `${shown.length} ${shown.length > 1 ? noun.many : noun.one} à voir`}
      </p>
      <div className="-mx-5 mt-3 min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-5 pb-4">
        {shown.length === 0 ? (
          <div className="flex flex-col items-center gap-3 pt-14 text-center">
            <span className="text-text-2">
              <FilmIcon size={40} />
            </span>
            <p className="text-[17px] font-semibold">Aucun{kind === 'serie' ? 'e' : ''} {noun.one} à voir</p>
            <p className="max-w-64 text-[15px] text-text-2">
              {partner ? `Note ce que vous voulez regarder, ${partner.name} le verra aussi.` : 'Note ce que tu veux regarder.'}
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2.5">
            <AnimatePresence initial={false}>
              {shown.map((item) => (
                <WatchCard key={item.id} item={item} onSeen={() => seen(item)} />
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  )
}
