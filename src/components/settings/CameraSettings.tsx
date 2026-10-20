import { useEffect, useRef, useState } from 'react'
import { cameraStatus, platform, requestCamera, type CameraAccess, type Platform } from '../../lib/camera'
import { useAppStore } from '../../store/appStore'
import { LoadingDots } from '../LoadingDots'
import { SettingsGroup, SettingsRow } from './SettingsGroup'

const STATUS: Record<CameraAccess, string> = {
  granted: 'Autorisé',
  denied: 'Refusé',
  prompt: 'Pas encore demandé',
  unknown: 'Non vérifié',
  unavailable: 'Indisponible',
}

const STEPS: Record<Platform, string[]> = {
  ios: [
    'Ouvre Réglages sur l’iPhone → Apps → Safari → Appareil photo (sur un iOS plus ancien : Réglages → Safari → Appareil photo) et choisis « Demander » ou « Autoriser ».',
    'Si Kalories est ouverte dans Safari : touche « aA » à gauche de l’adresse → Réglages du site web → Appareil photo → Autoriser.',
    'Ferme complètement Kalories (glisse-la vers le haut dans le multitâche), rouvre-la puis touche « Autoriser l’appareil photo ».',
  ],
  android: [
    'Appui long sur l’icône Kalories → ⓘ Infos sur l’appli → Autorisations → Appareil photo → Autoriser.',
    'Dans Chrome : touche l’icône à gauche de l’adresse → Autorisations → Appareil photo → Autoriser (ou « Réinitialiser les autorisations »).',
    'Rouvre Kalories puis touche « Autoriser l’appareil photo ».',
  ],
  other: [
    'Clique sur l’icône à gauche de l’adresse → Appareil photo → Autoriser.',
    'Recharge la page puis clique sur « Autoriser l’appareil photo ».',
  ],
}

function useCameraAccess() {
  const [access, setAccess] = useState<CameraAccess>('unknown')

  useEffect(() => {
    let alive = true
    let status: PermissionStatus | null = null
    const sync = () => alive && status && setAccess(status.state)
    const refresh = async () => {
      status?.removeEventListener('change', sync)
      status = await cameraStatus()
      if (!alive) return
      if (!status) return setAccess('mediaDevices' in navigator ? 'unknown' : 'unavailable')
      status.addEventListener('change', sync)
      sync()
    }
    const onVisible = () => !document.hidden && void refresh()
    void refresh()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      alive = false
      status?.removeEventListener('change', sync)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  return [access, setAccess] as const
}

export function CameraSettings() {
  const [access, setAccess] = useCameraAccess()
  const [help, setHelp] = useState(false)
  const [busy, setBusy] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (useAppStore.getState().settingsSection !== 'camera') return
    useAppStore.setState({ settingsSection: null })
    setHelp(true)
    const timer = setTimeout(() => ref.current?.scrollIntoView({ block: 'start', behavior: 'smooth' }), 350)
    return () => clearTimeout(timer)
  }, [])

  const ask = async () => {
    setBusy(true)
    const result = await requestCamera()
    setBusy(false)
    setAccess(result)
    if (result === 'granted') useAppStore.getState().showToast('Appareil photo autorisé')
    if (result === 'denied') setHelp(true)
  }

  return (
    <div ref={ref} className="scroll-mt-4">
      <SettingsGroup
        title="Appareil photo"
        footer="Si l’accès a été refusé, le téléphone ne redemande plus : il faut le réautoriser dans ses réglages."
      >
        <SettingsRow>
          <span className="flex-1 text-[17px]">Accès</span>
          <span className={`text-[15px] ${access === 'denied' ? 'font-semibold text-accent' : 'text-text-2'}`}>
            {STATUS[access]}
          </span>
        </SettingsRow>
        <SettingsRow>
          <button
            type="button"
            disabled={busy}
            onClick={() => void ask()}
            className="flex flex-1 items-center gap-2 text-left text-[17px] text-accent"
          >
            {busy ? (
              <>
                Veuillez patienter
                <LoadingDots />
              </>
            ) : access === 'granted' ? (
              'Tester l’appareil photo'
            ) : (
              'Autoriser l’appareil photo'
            )}
          </button>
        </SettingsRow>
        <SettingsRow>
          <button
            type="button"
            aria-expanded={help}
            onClick={() => setHelp(!help)}
            className="flex-1 text-left text-[17px] text-accent"
          >
            Réinitialiser l’autorisation
          </button>
        </SettingsRow>
        {help && (
          <ol className="list-decimal space-y-2 py-3 pr-4 pl-9 text-[15px] leading-snug text-text-2 marker:text-accent">
            {STEPS[platform()].map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        )}
      </SettingsGroup>
    </div>
  )
}
