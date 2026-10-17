import { useRef, useState, type ChangeEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useCamera } from '../../hooks/useCamera'
import { captureVideoFrame } from '../../lib/image'
import { BarcodeIcon } from '../icons/BarcodeIcon'
import { CameraIcon } from '../icons/CameraIcon'
import { GalleryIcon } from '../icons/GalleryIcon'

interface Props {
  active: boolean
  onPhoto: (src: string) => void
  onFiles: (files: File[]) => void
  onScan: () => void
}

export function CameraView({ active, onPhoto, onFiles, onScan }: Props) {
  const { videoRef, state } = useCamera(active)
  const [shots, setShots] = useState(0)
  const galleryRef = useRef<HTMLInputElement>(null)
  const captureRef = useRef<HTMLInputElement>(null)
  const live = state === 'ready' || state === 'starting'

  const shoot = () => {
    const video = videoRef.current
    const photo = video && captureVideoFrame(video)
    if (!photo) return
    setShots((n) => n + 1)
    onPhoto(photo)
  }

  const pick = (event: ChangeEvent<HTMLInputElement>) => {
    onFiles(Array.from(event.target.files ?? []))
    event.target.value = ''
  }

  return (
    <div className="relative min-h-0 flex-1 overflow-hidden rounded-card border border-line bg-surface-2">
      {live ? (
        <video ref={videoRef} autoPlay muted playsInline className="absolute inset-0 size-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
          <span className="text-text-2">
            <CameraIcon size={32} />
          </span>
          <p className="text-[15px] text-text-2">
            {state === 'denied' ? 'Accès à la caméra refusé' : 'Caméra indisponible'}
          </p>
          <button
            type="button"
            onClick={() => captureRef.current?.click()}
            className="h-11 rounded-full border border-accent/50 px-5 text-[15px] font-medium text-accent"
          >
            Prendre une photo
          </button>
        </div>
      )}
      <AnimatePresence>
        {shots > 0 && (
          <motion.div
            key={shots}
            className="pointer-events-none absolute inset-0 bg-white"
            initial={{ opacity: 0.75 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          />
        )}
      </AnimatePresence>
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-center p-4">
        <button
          type="button"
          onClick={() => galleryRef.current?.click()}
          className="absolute left-4 flex h-10 items-center gap-2 rounded-full bg-black/45 px-3.5 text-[14px] text-text backdrop-blur-md"
        >
          <GalleryIcon size={18} />
          Galerie
        </button>
        <button
          type="button"
          onClick={onScan}
          className="absolute right-4 flex h-10 items-center gap-2 rounded-full bg-black/45 px-3.5 text-[14px] text-text backdrop-blur-md"
        >
          <BarcodeIcon size={18} />
          Code-barres
        </button>
        {live && (
          <motion.button
            type="button"
            aria-label="Prendre la photo"
            onClick={shoot}
            disabled={state !== 'ready'}
            whileTap={{ scale: 0.9 }}
            className="grid size-[68px] place-items-center rounded-full border-[3px] border-white/85 disabled:opacity-50"
          >
            <span className="size-[54px] rounded-full bg-accent shadow-[0_0_20px_rgba(255,122,26,0.5)]" />
          </motion.button>
        )}
      </div>
      <input ref={galleryRef} type="file" accept="image/*" multiple hidden onChange={pick} />
      <input ref={captureRef} type="file" accept="image/*" capture="environment" multiple hidden onChange={pick} />
    </div>
  )
}
