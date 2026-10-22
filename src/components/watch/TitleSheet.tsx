import { useRef } from 'react'
import { useTitleDetails } from '../../hooks/useTitleDetails'
import type { WatchItem } from '../../lib/watchlist'
import type { TitleDetails } from '../../lib/wiki'
import { BottomSheet } from '../BottomSheet'
import { LoadingDots } from '../LoadingDots'
import { Poster } from './Poster'

interface Props {
  item: WatchItem | null
  onClose: () => void
  onDelete: (item: WatchItem) => void
}

export function TitleSheet({ item, onClose, onDelete }: Props) {
  const last = useRef(item)
  if (item) last.current = item
  const shown = item ?? last.current
  const { state, retry } = useTitleDetails(item)

  return (
    <BottomSheet open={item !== null} title={shown?.title ?? ''} onClose={onClose}>
      {shown && (
        <div className="flex flex-col gap-5 pt-1 pb-2">
          {state.status === 'ready' ? (
            <Details details={state.details} poster={shown.poster} />
          ) : state.status === 'error' ? (
            <div role="alert" className="flex flex-col items-start gap-3 rounded-card border border-line bg-surface-2 p-4">
              <p className="text-[15px] leading-snug">{state.message}</p>
              <button type="button" onClick={retry} className="press h-10 rounded-full bg-accent px-5 text-[15px] font-semibold text-black">
                Réessayer
              </button>
            </div>
          ) : (
            <p role="status" className="flex items-center gap-2 px-1 py-8 text-[15px] text-text-2">
              Recherche sur Wikipédia
              <LoadingDots />
            </p>
          )}
          <button
            type="button"
            onClick={() => onDelete(shown)}
            className="press h-12 rounded-full border border-line bg-surface-2 text-[15px] font-semibold text-accent"
          >
            Retirer de la liste
          </button>
        </div>
      )}
    </BottomSheet>
  )
}

function hours(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h ? `${h} h ${m ? String(m).padStart(2, '0') : ''}`.trim() : `${m} min`
}

function Details({ details, poster }: { details: TitleDetails; poster: string }) {
  const facts = [
    details.year,
    details.runtime && hours(details.runtime),
    details.seasons && `${details.seasons} saison${details.seasons > 1 ? 's' : ''}`,
  ].filter(Boolean)

  return (
    <>
      <div className="flex gap-4">
        <Poster src={details.poster || poster} className="h-44 w-30 rounded-xl" icon={32} />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {details.description && <p className="text-[15px] leading-snug text-text-2">{details.description}</p>}
          {facts.length > 0 && <p className="text-[15px] font-semibold">{facts.join(' · ')}</p>}
          {details.makers.length > 0 && (
            <p className="text-[14px] leading-snug">
              <span className="text-text-2">{details.kind === 'serie' ? 'Création' : 'Réalisation'} : </span>
              {details.makers.join(', ')}
            </p>
          )}
        </div>
      </div>
      <section>
        <h3 className="label mb-2 px-1">Synopsis</h3>
        <p className="text-[15px] leading-relaxed whitespace-pre-line">
          {details.synopsis || 'Wikipédia ne donne pas encore de résumé pour ce titre.'}
        </p>
      </section>
      {details.cast.length > 0 && (
        <section>
          <h3 className="label mb-2 px-1">Distribution</h3>
          <ul className="flex flex-wrap gap-2">
            {details.cast.map((name) => (
              <li key={name} className="rounded-full border border-line bg-surface-2 px-3 py-1.5 text-[14px]">
                {name}
              </li>
            ))}
          </ul>
        </section>
      )}
      <p className="px-1 text-[12px] leading-snug text-text-2">
        Infos : Wikipédia et Wikidata{details.kind === 'serie' ? ', TVmaze' : ''} ·{' '}
        <a href={details.url} target="_blank" rel="noreferrer" className="text-accent underline underline-offset-2">
          voir la page
        </a>
      </p>
    </>
  )
}
