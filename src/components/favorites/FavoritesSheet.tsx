import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { useFavorites } from '../../hooks/useFavorites'
import type { Favorite } from '../../lib/favorites'
import type { MealItem } from '../../lib/nutrition'
import { ChevronIcon } from '../icons/ChevronIcon'
import { CloseIcon } from '../icons/CloseIcon'
import { HeartIcon } from '../icons/HeartIcon'
import { FavoriteEditor } from './FavoriteEditor'
import { FavoriteList } from './FavoriteList'

interface Props {
  open: boolean
  uid: string
  onClose: () => void
  onAdd: (items: MealItem[]) => void
}

type Phase = { kind: 'list' } | { kind: 'edit'; favorite: Favorite | null }

export function FavoritesSheet({ open, uid, onClose, onAdd }: Props) {
  const { favorites, loaded } = useFavorites(uid)
  const [phase, setPhase] = useState<Phase>({ kind: 'list' })
  const [selection, setSelection] = useState<Record<string, number>>({})
  const editing = phase.kind === 'edit' ? phase.favorite : undefined

  useEffect(() => {
    if (!open) return
    setPhase({ kind: 'list' })
    setSelection({})
  }, [open])

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Favoris"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ type: 'spring', stiffness: 380, damping: 36 }}
          className="safe-screen fixed inset-0 z-[70] flex flex-col bg-bg px-5"
        >
          <div className="flex shrink-0 items-center gap-2 pt-3 pb-3">
            {editing !== undefined && (
              <button
                type="button"
                aria-label="Retour"
                onClick={() => setPhase({ kind: 'list' })}
                className="-ml-2 grid size-10 place-items-center rounded-full text-text-2"
              >
                <ChevronIcon size={22} direction="left" />
              </button>
            )}
            <h2 className="flex flex-1 items-center gap-2 text-[20px] font-semibold">
              {editing === undefined ? (
                <>
                  <span className="text-accent">
                    <HeartIcon size={20} filled />
                  </span>
                  Favoris
                </>
              ) : editing ? (
                'Modifier le favori'
              ) : (
                'Nouveau favori'
              )}
            </h2>
            <button
              type="button"
              aria-label="Fermer"
              onClick={onClose}
              className="grid size-10 place-items-center rounded-full bg-surface-2 text-text-2"
            >
              <CloseIcon size={20} />
            </button>
          </div>
          <div className="flex min-h-0 flex-1 flex-col pb-4">
            {editing === undefined ? (
              <FavoriteList
                favorites={favorites}
                loaded={loaded}
                selection={selection}
                onSelection={setSelection}
                onEdit={(favorite) => setPhase({ kind: 'edit', favorite })}
                onAdd={onAdd}
              />
            ) : (
              <FavoriteEditor
                key={editing?.id ?? 'new'}
                uid={uid}
                favorite={editing}
                onDone={(created) => {
                  if (created) setSelection((current) => ({ ...current, [created.id]: created.grams }))
                  setPhase({ kind: 'list' })
                }}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
