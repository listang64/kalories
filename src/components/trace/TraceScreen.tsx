import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useCamera } from '../../hooks/useCamera'
import { usePinch } from '../../hooks/usePinch'
import { useWakeLock } from '../../hooks/useWakeLock'
import { useTraceStore } from '../../lib/trace/store'
import { useAppStore } from '../../store/appStore'
import { ChevronIcon } from '../icons/ChevronIcon'
import { CloseIcon } from '../icons/CloseIcon'
import { GalleryIcon } from '../icons/GalleryIcon'
import { LockIcon } from '../icons/LockIcon'
import { TracePanel } from './TracePanel'

const ROUND = 'press grid size-11 place-items-center rounded-full bg-black/60 text-text backdrop-blur-md'

function TraceView({ onClose }: { onClose: () => void }) {
  const { videoRef, state } = useCamera(true)
  const { image, placement, opacity, mirror, contrast, locked, place, setImage, set } = useTraceStore()
  const gestures = usePinch(placement, place, locked || !image)
  const [panel, setPanel] = useState(true)
  const input = useRef<HTMLInputElement>(null)
  useWakeLock(true)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const pick = () => input.current?.click()
  const cameraSettings = () => {
    onClose()
    useAppStore.getState().openSettingsOnTop('camera')
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="Calque de dessin" className="fixed inset-0 z-50 overflow-hidden bg-black select-none">
      <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0 touch-none" {...gestures}>
        {image && (
          <img
            src={image}
            alt="Image à décalquer"
            draggable={false}
            className="pointer-events-none absolute top-1/2 left-1/2 max-h-[70vh] max-w-[85vw]"
            style={{
              opacity,
              filter: contrast ? 'grayscale(1) contrast(1.9)' : undefined,
              transform: `translate(-50%, -50%) translate(${placement.x}px, ${placement.y}px) rotate(${placement.rotation}deg) scale(${mirror ? -placement.scale : placement.scale}, ${placement.scale})`,
            }}
          />
        )}
      </div>
      <div className="absolute inset-x-0 top-[calc(var(--safe-top)+10px)] z-10 flex items-center justify-between px-4">
        <button type="button" aria-label="Fermer le calque" onClick={onClose} className={ROUND}>
          <CloseIcon size={20} />
        </button>
        {image && (
          <button
            type="button"
            aria-pressed={locked}
            onClick={() => set({ locked: !locked })}
            className={`press flex h-11 items-center gap-2 rounded-full px-4 text-[15px] font-semibold backdrop-blur-md ${locked ? 'bg-accent text-black' : 'bg-black/60 text-text'}`}
          >
            <LockIcon size={18} open={!locked} />
            {locked ? 'Image bloquée' : 'Bloquer l’image'}
          </button>
        )}
      </div>
      {(state === 'denied' || state === 'unavailable') && (
        <div className="absolute inset-x-6 top-[calc(var(--safe-top)+72px)] z-10 rounded-card bg-black/75 p-4 text-center text-[15px]">
          <p>{state === 'denied' ? 'La caméra est bloquée pour Kalories.' : 'Caméra indisponible.'}</p>
          <button type="button" onClick={cameraSettings} className="mt-2 font-semibold text-accent">
            Régler la caméra
          </button>
        </div>
      )}
      {!image && (
        <div className="absolute inset-x-8 top-1/2 z-10 -translate-y-1/2 rounded-sheet bg-black/70 p-6 text-center backdrop-blur-md">
          <p className="text-[19px] font-semibold">Choisis une image à décalquer</p>
          <p className="mt-1.5 text-[14px] leading-snug text-text-2">
            Pose ton téléphone en hauteur au-dessus de la feuille, puis suis les traits à l’écran.
          </p>
          <button type="button" onClick={pick} className="press mx-auto mt-4 flex h-12 items-center gap-2 rounded-full bg-accent px-5 text-[16px] font-semibold text-black">
            <GalleryIcon size={20} />
            Choisir une image
          </button>
        </div>
      )}
      {image &&
        (panel ? (
          <TracePanel onPick={pick} onHide={() => setPanel(false)} />
        ) : (
          <button
            type="button"
            aria-label="Afficher les réglages"
            onClick={() => setPanel(true)}
            className={`absolute bottom-[calc(var(--safe-bottom)+16px)] left-1/2 z-10 -translate-x-1/2 ${ROUND}`}
          >
            <ChevronIcon size={22} direction="up" />
          </button>
        ))}
      <input
        ref={input}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) setImage(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}

export function TraceScreen({ open, onClose }: { open: boolean; onClose: () => void }) {
  return open ? createPortal(<TraceView onClose={onClose} />, document.body) : null
}
