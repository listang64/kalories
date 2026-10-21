import { useEffect, useRef, useState } from 'react'
import { browserInfo, cameraStatus, platform, requestCamera, type CameraAccess, type CameraProbe, type Platform } from '../../lib/camera'
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

const STEPS: Record<Platform | 'samsung', string[]> = {
  ios: [
    'Ouvre Réglages sur l’iPhone → Apps → Safari → Appareil photo (sur un iOS plus ancien : Réglages → Safari → Appareil photo) et choisis « Demander » ou « Autoriser ».',
    'Si Kalories est ouverte dans Safari : touche « aA » à gauche de l’adresse → Réglages du site web → Appareil photo → Autoriser.',
    'Ferme complètement Kalories (glisse-la vers le haut dans le multitâche), rouvre-la puis touche « Autoriser l’appareil photo ».',
  ],
  android: [
    'Chrome : menu ⋮ → Paramètres → Paramètres des sites → Appareil photo. L’interrupteur du haut doit être activé ; dans « Bloqué », touche listang64.github.io → Autoriser.',
    'Android : Paramètres → Applications → Chrome → Autorisations → Appareil photo → « Autoriser seulement si l’appli est en cours d’utilisation ».',
    'Android 12 et plus : Paramètres → Sécurité et confidentialité → Confidentialité → « Accès à l’appareil photo » activé (aussi dans les réglages rapides en haut de l’écran).',
    'Si Kalories a une icône sur l’écran d’accueil : Paramètres → Applications → Kalories → Autorisations → Appareil photo → Autoriser.',
    'Samsung Internet : menu ≡ → Paramètres → Sites et téléchargements → Autorisations des sites → Appareil photo.',
    'Ferme complètement Kalories, rouvre-la puis touche « Autoriser l’appareil photo » : le diagnostic dit ce qui bloque encore.',
  ],
  samsung: [
    'Ouvre Samsung Internet (le navigateur lui-même) → menu ≡ en bas à droite → Paramètres → Sites et téléchargements → Autorisations des sites → Appareil photo.',
    'Touche listang64.github.io (dans « Bloqué ») puis choisis « Autoriser », ou supprime-le de la liste pour que la question revienne.',
    'Android : Paramètres → Applications → Samsung Internet → Autorisations → Appareil photo → « Autoriser seulement si l’appli est en cours d’utilisation ».',
    'Paramètres → Sécurité et confidentialité → Confidentialité → « Accès à l’appareil photo » activé (aussi dans les réglages rapides).',
    'Ferme complètement Kalories (multitâche), rouvre-la puis touche « Autoriser l’appareil photo ».',
    'Si ça bloque encore : ouvre listang64.github.io/kalories dans Chrome, connecte-toi, puis menu ⋮ → Installer l’application. Chrome redemandera l’accès à la caméra.',
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
  const [probe, setProbe] = useState<CameraProbe | null>(null)
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
    setProbe(result)
    setAccess(result.access)
    if (result.access === 'granted') useAppStore.getState().showToast('Appareil photo autorisé')
    else setHelp(true)
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
        {probe && probe.access !== 'granted' && <Diagnostic probe={probe} />}
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
            {STEPS[browserInfo().samsung ? 'samsung' : platform()].map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        )}
      </SettingsGroup>
    </div>
  )
}

function Diagnostic({ probe }: { probe: CameraProbe }) {
  const browser = browserInfo()
  return (
    <div role="status" className="space-y-1.5 px-4 py-3 text-[14px] leading-snug">
      <p className="font-semibold text-accent">{probe.advice}</p>
      <p className="text-text-2">
        {browser.name} · {browser.installed ? 'app installée' : 'dans le navigateur'}
      </p>
      <p className="font-mono text-[12px] break-words text-text-2">{probe.error}</p>
    </div>
  )
}
