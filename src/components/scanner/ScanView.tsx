import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { useBarcodeScanner } from '../../hooks/useBarcodeScanner'
import { useCamera } from '../../hooks/useCamera'
import { BARCODE, readBarcodePhoto } from '../../lib/barcode'
import { CameraIcon } from '../icons/CameraIcon'
import { LoadingDots } from '../LoadingDots'
import { ScanFrame } from './ScanFrame'

interface Props {
  active: boolean
  onCode: (code: string) => void
}

export function ScanView({ active, onCode }: Props) {
  const { videoRef, state } = useCamera(active)
  const { failed } = useBarcodeScanner(videoRef, active && state === 'ready', onCode)
  const [typing, setTyping] = useState(false)
  const [digits, setDigits] = useState('')
  const [reading, setReading] = useState(false)
  const [photoError, setPhotoError] = useState('')
  const photoRef = useRef<HTMLInputElement>(null)
  const live = (state === 'ready' || state === 'starting') && !failed

  const readPhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setReading(true)
    setPhotoError('')
    const code = await readBarcodePhoto(file).catch(() => null)
    setReading(false)
    if (code) onCode(code)
    else setPhotoError('Aucun code-barres lu : reprends la photo de plus près, bien à plat, ou saisis les chiffres.')
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (BARCODE.test(digits)) onCode(digits)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-card bg-surface-2">
        {live ? (
          <video ref={videoRef} autoPlay muted playsInline className="absolute inset-0 size-full object-cover" />
        ) : (
          <div className="absolute inset-x-6 top-1/2 flex -translate-y-1/2 flex-col items-center gap-4 text-center">
            <p className="text-[15px] text-text-2">
              {state === 'denied' ? 'Accès à la caméra refusé.' : 'Lecture impossible avec la caméra.'} Prends le
              code-barres en photo ou saisis ses chiffres.
            </p>
            <button
              type="button"
              disabled={reading}
              onClick={() => photoRef.current?.click()}
              className="press flex h-12 items-center gap-2 rounded-full bg-accent px-5 text-[16px] font-semibold text-black"
            >
              {reading ? (
                <>
                  Lecture de la photo
                  <LoadingDots />
                </>
              ) : (
                <>
                  <CameraIcon size={20} />
                  Photo du code-barres
                </>
              )}
            </button>
            {photoError && <p className="text-[14px] text-accent">{photoError}</p>}
          </div>
        )}
        {live && <ScanFrame hint="Vise le code-barres du paquet" />}
      </div>
      <input ref={photoRef} type="file" accept="image/*" hidden onChange={(e) => void readPhoto(e)} />
      {typing || !live ? (
        <form onSubmit={submit} className="mt-3 flex shrink-0 items-center gap-2 rounded-full border border-line bg-surface-2 py-1.5 pr-1.5 pl-4">
          <input
            aria-label="Chiffres du code-barres"
            value={digits}
            onChange={(e) => setDigits(e.target.value.replace(/\D/g, '').slice(0, 14))}
            inputMode="numeric"
            enterKeyHint="search"
            placeholder="ex. 3017620422003"
            className="min-w-0 flex-1 bg-transparent text-base tabular-nums outline-none placeholder:text-text-2"
          />
          <button
            type="submit"
            disabled={!BARCODE.test(digits)}
            className="h-10 rounded-full bg-accent px-4 text-[15px] font-semibold text-black disabled:opacity-35"
          >
            Chercher
          </button>
        </form>
      ) : (
        <button type="button" onClick={() => setTyping(true)} className="mt-3 h-11 shrink-0 text-[15px] text-text-2">
          Saisir le code à la main
        </button>
      )}
    </div>
  )
}
