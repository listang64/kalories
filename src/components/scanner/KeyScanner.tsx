import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { useBarcodeScanner } from '../../hooks/useBarcodeScanner'
import { useCamera } from '../../hooks/useCamera'
import type { ScanOptions } from '../../lib/barcode'
import { cleanKey, looksLikeGeminiKey } from '../../lib/localSettings'
import { CloseIcon } from '../icons/CloseIcon'
import { ScanFrame } from './ScanFrame'

interface Props {
  open: boolean
  onClose: () => void
  onKey: (key: string) => void
}

const KEY_SCAN: ScanOptions = {
  formats: ['qr_code'],
  accept: (value) => {
    const key = cleanKey(value)
    return looksLikeGeminiKey(key) ? key : null
  },
}

export function KeyScanner({ open, onClose, onKey }: Props) {
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Scanner une clé Gemini"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ type: 'spring', stiffness: 380, damping: 36 }}
          className="safe-screen fixed inset-0 z-[70] flex flex-col bg-bg px-5"
        >
          <div className="flex shrink-0 items-center gap-2 pt-3 pb-3">
            <h2 className="flex-1 text-[20px] font-semibold">Clé Gemini</h2>
            <button
              type="button"
              aria-label="Fermer"
              onClick={onClose}
              className="grid size-10 place-items-center rounded-full bg-surface-2 text-text-2"
            >
              <CloseIcon size={20} />
            </button>
          </div>
          <KeyCamera onKey={onKey} />
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

function KeyCamera({ onKey }: { onKey: (key: string) => void }) {
  const { videoRef, state } = useCamera(true)
  const { failed } = useBarcodeScanner(videoRef, state === 'ready', onKey, KEY_SCAN)
  const live = (state === 'ready' || state === 'starting') && !failed

  return (
    <div className="relative mb-4 min-h-0 flex-1 overflow-hidden rounded-card bg-surface-2">
      {live ? (
        <>
          <video ref={videoRef} autoPlay muted playsInline className="absolute inset-0 size-full object-cover" />
          <ScanFrame square hint="Vise le QR code affiché sur l’autre téléphone" />
        </>
      ) : (
        <p className="absolute inset-x-6 top-1/3 text-center text-[15px] text-text-2">
          {state === 'denied' ? 'Accès à la caméra refusé.' : 'Lecture impossible avec la caméra.'} Colle la clé à la
          place.
        </p>
      )}
    </div>
  )
}
