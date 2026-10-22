import type { TitleSearch } from '../../hooks/useTitleSearch'
import type { TitleHit } from '../../lib/wiki'
import { LoadingDots } from '../LoadingDots'
import { PlusIcon } from '../icons/PlusIcon'

interface Props {
  search: TitleSearch
  text: string
  noun: string
  taken: (hit: TitleHit) => boolean
  onPick: (hit: TitleHit) => void
  onManual: () => void
}

export function SuggestionList({ search, text, noun, taken, onPick, onManual }: Props) {
  const { loading, hits, error } = search

  return (
    <div className="flex flex-col gap-2" aria-busy={loading}>
      <p className="label flex h-4 items-center gap-2 px-1">
        {loading ? (
          <>
            Recherche sur Wikipédia
            <LoadingDots />
          </>
        ) : error ? (
          <span className="text-accent normal-case">{error}</span>
        ) : hits.length ? (
          'Touche le bon titre pour l’ajouter'
        ) : (
          text.trim().length > 1 && `Aucun${noun === 'série' ? 'e' : ''} ${noun} trouvé${noun === 'série' ? 'e' : ''} sur Wikipédia`
        )}
      </p>
      <ul className="flex flex-col gap-2">
        {hits.map((hit) => {
          const added = taken(hit)
          return (
            <li key={hit.ref}>
              <button
                type="button"
                disabled={added}
                onClick={() => onPick(hit)}
                className="press flex w-full items-center gap-3 rounded-card border border-line bg-surface-2 px-4 py-3 text-left disabled:opacity-50"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-[16px] leading-snug font-semibold">{hit.title}</span>
                  <span className="mt-0.5 line-clamp-2 block text-[13px] leading-snug text-text-2">
                    {hit.description || 'Sans description'}
                  </span>
                </span>
                {added ? (
                  <span className="shrink-0 text-[13px] text-text-2">Déjà dans la liste</span>
                ) : (
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-black">
                    <PlusIcon size={18} strokeWidth={2} />
                  </span>
                )}
              </button>
            </li>
          )
        })}
        {text.trim() && (
          <li>
            <button
              type="button"
              onClick={onManual}
              className="press flex min-h-11 w-full items-center justify-center rounded-card border border-dashed border-white/15 px-4 py-2.5 text-center text-[15px] text-text-2"
            >
              Ajouter « {text.trim()} » tel quel
            </button>
          </li>
        )}
      </ul>
    </div>
  )
}
