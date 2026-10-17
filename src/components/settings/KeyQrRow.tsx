import { useState } from 'react'
import { BottomPanel } from '../BottomPanel'
import { QrCode } from '../QrCode'
import { KeyScanner } from '../scanner/KeyScanner'
import { SettingsRow } from './SettingsGroup'

interface Props {
  geminiKey: string
  onScanned: (key: string) => void
}

export function KeyQrRow({ geminiKey, onScanned }: Props) {
  const [showing, setShowing] = useState(false)
  const [scanning, setScanning] = useState(false)

  return (
    <>
      <SettingsRow>
        <span className="flex-1 text-[17px]">QR code</span>
        {geminiKey && (
          <button type="button" onClick={() => setShowing(true)} className="text-[15px] text-accent">
            Afficher
          </button>
        )}
        <button type="button" onClick={() => setScanning(true)} className="text-[15px] text-accent">
          Scanner
        </button>
      </SettingsRow>
      <BottomPanel open={showing} label="QR code de ta clé Gemini" onClose={() => setShowing(false)}>
        <div className="mt-4 flex flex-col items-center gap-3 text-center">
          <h3 className="text-[17px] font-semibold">QR code de ta clé Gemini</h3>
          <div className="w-[min(70vw,280px)] overflow-hidden rounded-card">
            <QrCode text={geminiKey} label="QR code de la clé Gemini" />
          </div>
          <p className="max-w-80 text-[15px] text-text-2">
            Sur l’autre téléphone : Paramètres, Gemini, QR code, Scanner.
          </p>
          <p className="max-w-80 text-[13px] text-text-2">
            Montre-le seulement à des proches : cette clé donne accès à ton compte Gemini.
          </p>
          <button type="button" onClick={() => setShowing(false)} className="h-11 w-full text-[15px] text-text-2">
            Fermer
          </button>
        </div>
      </BottomPanel>
      <KeyScanner
        open={scanning}
        onClose={() => setScanning(false)}
        onKey={(key) => {
          setScanning(false)
          onScanned(key)
        }}
      />
    </>
  )
}
