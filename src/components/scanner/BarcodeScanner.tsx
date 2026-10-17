import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import type { MealItem } from '../../lib/nutrition'
import { lookupProduct, type Lookup } from '../../lib/openFoodFacts'
import { CloseIcon } from '../icons/CloseIcon'
import { ProductPanel } from './ProductPanel'
import { ScanView } from './ScanView'

interface Props {
  open: boolean
  onClose: () => void
  onAdd: (item: MealItem) => void
}

type Phase = { kind: 'scan' } | { kind: 'loading'; code: string } | { kind: 'done'; code: string; lookup: Lookup }

const MESSAGES: Record<Exclude<Lookup['status'], 'found'>, string> = {
  'not-found': 'Produit introuvable dans Open Food Facts.',
  'no-nutrition': 'Ce produit n’a pas de valeurs nutritionnelles dans Open Food Facts.',
  offline: 'Pas de connexion : la recherche du produit demande du réseau.',
  unavailable: 'Open Food Facts ne répond pas pour l’instant.',
}

export function BarcodeScanner({ open, onClose, onAdd }: Props) {
  const [phase, setPhase] = useState<Phase>({ kind: 'scan' })

  useEffect(() => {
    if (open) setPhase({ kind: 'scan' })
  }, [open])

  const search = async (code: string) => {
    setPhase({ kind: 'loading', code })
    const lookup = await lookupProduct(code)
    setPhase((current) => (current.kind === 'loading' && current.code === code ? { kind: 'done', code, lookup } : current))
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Scanner un code-barres"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ type: 'spring', stiffness: 380, damping: 36 }}
          className="safe-screen fixed inset-0 z-[70] flex flex-col bg-bg px-5"
        >
          <div className="flex shrink-0 items-center gap-2 pt-3 pb-3">
            <h2 className="flex-1 text-[20px] font-semibold">Code-barres</h2>
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
            {phase.kind === 'scan' && <ScanView active={open} onCode={(code) => void search(code)} />}
            {phase.kind === 'loading' && (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 text-text-2">
                <span className="size-9 animate-spin rounded-full border-[3px] border-white/15 border-t-accent" />
                <p className="text-[15px]">Recherche du produit…</p>
                <p className="text-[13px] tabular-nums">{phase.code}</p>
              </div>
            )}
            {phase.kind === 'done' && phase.lookup.status === 'found' && (
              <ProductPanel
                key={phase.code}
                product={phase.lookup.product}
                onAdd={onAdd}
                onRescan={() => setPhase({ kind: 'scan' })}
              />
            )}
            {phase.kind === 'done' && phase.lookup.status !== 'found' && (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 text-center">
                <p className="text-[17px] font-semibold">{MESSAGES[phase.lookup.status]}</p>
                <p className="text-[15px] text-text-2 tabular-nums">Code {phase.code}</p>
                <p className="mt-1 max-w-72 text-[14px] text-text-2">
                  Tu peux aussi prendre le paquet en photo : Gemini estimera les valeurs.
                </p>
                <button
                  type="button"
                  onClick={() => setPhase({ kind: 'scan' })}
                  className="press mt-5 h-12 rounded-full bg-accent px-6 text-[15px] font-semibold text-black"
                >
                  Scanner à nouveau
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
