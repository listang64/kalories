import { useState, type FormEvent } from 'react'
import { motion } from 'motion/react'
import { useBarcodeScanner } from '../../hooks/useBarcodeScanner'
import { useCamera } from '../../hooks/useCamera'
import { BARCODE } from '../../lib/barcode'

interface Props {
  active: boolean
  onCode: (code: string) => void
}

const CORNER = 'absolute size-7 border-accent'

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
        {live && (
          <div className="absolute inset-0 grid place-items-center">
            <div className="relative aspect-[16/9] w-[80%] rounded-[14px] shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
              <span className={`${CORNER} top-0 left-0 rounded-tl-[14px] border-t-[3px] border-l-[3px]`} />
              <span className={`${CORNER} top-0 right-0 rounded-tr-[14px] border-t-[3px] border-r-[3px]`} />
              <span className={`${CORNER} bottom-0 left-0 rounded-bl-[14px] border-b-[3px] border-l-[3px]`} />
              <span className={`${CORNER} right-0 bottom-0 rounded-br-[14px] border-r-[3px] border-b-[3px]`} />
              <motion.span
                className="absolute inset-x-4 h-0.5 rounded-full bg-accent shadow-[0_0_12px_rgba(255,122,26,0.9)]"
                initial={{ top: '12%' }}
                animate={{ top: ['12%', '88%', '12%'] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
            <p className="absolute inset-x-0 bottom-5 text-center text-[15px] text-white/85">
              Vise le code-barres du paquet
            </p>
          </div>
        )}
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
