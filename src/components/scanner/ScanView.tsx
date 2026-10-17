import { useState, type FormEvent } from 'react'
import { useBarcodeScanner } from '../../hooks/useBarcodeScanner'
import { useCamera } from '../../hooks/useCamera'
import { BARCODE } from '../../lib/barcode'
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
  const live = (state === 'ready' || state === 'starting') && !failed

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
          <p className="absolute inset-x-6 top-1/3 text-center text-[15px] text-text-2">
            {state === 'denied' ? 'Accès à la caméra refusé.' : 'Lecture impossible avec la caméra.'} Saisis les
            chiffres du code-barres.
          </p>
        )}
        {live && <ScanFrame hint="Vise le code-barres du paquet" />}
      </div>
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
