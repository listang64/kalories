export type CameraAccess = 'granted' | 'denied' | 'prompt' | 'unknown' | 'unavailable'

export type Platform = 'ios' | 'android' | 'other'

export interface CameraProbe {
  access: CameraAccess
  error: string
  advice: string
}

export interface BrowserInfo {
  name: string
  samsung: boolean
  inApp: boolean
  installed: boolean
}

export function isCameraDenied(error: unknown): boolean {
  return error instanceof DOMException && (error.name === 'NotAllowedError' || error.name === 'SecurityError')
}

export async function cameraStatus(): Promise<PermissionStatus | null> {
  try {
    return await navigator.permissions.query({ name: 'camera' as PermissionName })
  } catch {
    return null
  }
}

export function platform(): Platform {
  const agent = navigator.userAgent
  if (/iPhone|iPad|iPod/.test(agent) || (/Macintosh/.test(agent) && navigator.maxTouchPoints > 1)) return 'ios'
  return /Android/.test(agent) ? 'android' : 'other'
}

const BROWSERS: [RegExp, string][] = [
  [/SamsungBrowser\/([\d.]+)/, 'Samsung Internet'],
  [/EdgA\/(\d+)/, 'Edge'],
  [/OPR\/(\d+)|OPT\/(\d+)/, 'Opera'],
  [/Firefox\/(\d+)|FxiOS\/(\d+)/, 'Firefox'],
  [/CriOS\/(\d+)|Chrome\/(\d+)/, 'Chrome'],
  [/Version\/([\d.]+).*Safari/, 'Safari'],
]

export function browserInfo(): BrowserInfo {
  const agent = navigator.userAgent
  const inApp = /FBAN|FBAV|FB_IAB|Instagram|Snapchat|Line\/|; wv\)/.test(agent)
  const match = BROWSERS.map(([pattern, label]) => ({ found: pattern.exec(agent), label })).find(({ found }) => found)
  const version = match?.found?.slice(1).find(Boolean)?.split('.')[0]
  const name = inApp ? 'Navigateur intégré d’une autre app' : match ? `${match.label}${version ? ` ${version}` : ''}` : 'Navigateur inconnu'
  const standalone = (navigator as { standalone?: boolean }).standalone === true
  return {
    name,
    samsung: /SamsungBrowser/.test(agent),
    inApp,
    installed: standalone || window.matchMedia('(display-mode: standalone)').matches,
  }
}

function adviceFor(error: unknown, browser: BrowserInfo): string {
  const name = error instanceof DOMException ? error.name : ''
  const message = error instanceof Error ? error.message : ''
  if (browser.inApp) return 'Kalories est ouverte dans le navigateur d’une autre app, qui bloque la caméra : ouvre le lien dans Chrome.'
  if (browser.samsung && (name === 'NotAllowedError' || name === 'SecurityError'))
    return 'Kalories passe par Samsung Internet : c’est dans les réglages de Samsung Internet, pas de Chrome, qu’il faut débloquer la caméra (étapes ci-dessous).'
  if (/system/i.test(message))
    return 'C’est Android qui bloque le navigateur : Paramètres → Applications → Chrome → Autorisations → Appareil photo → Autoriser, et vérifie « Accès à l’appareil photo » dans Confidentialité.'
  if (name === 'NotAllowedError' || name === 'SecurityError')
    return 'Le navigateur refuse l’accès à ce site : suis les étapes de « Réinitialiser l’autorisation » ci-dessous.'
  if (name === 'NotReadableError' || name === 'TrackStartError' || name === 'AbortError')
    return 'La caméra est occupée ou coupée par le téléphone : ferme les apps qui l’utilisent, vérifie « Accès à l’appareil photo » dans Confidentialité, ou redémarre le téléphone.'
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError') return 'Aucune caméra détectée par le navigateur.'
  return 'Le navigateur n’a pas pu ouvrir la caméra : essaie dans Chrome à jour.'
}

export async function requestCamera(): Promise<CameraProbe> {
  if (!navigator.mediaDevices?.getUserMedia) {
    const error = window.isSecureContext ? 'Caméra non prise en charge par ce navigateur' : 'Page non sécurisée'
    return { access: 'unavailable', error, advice: 'Ouvre Kalories dans Chrome à jour.' }
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    stream.getTracks().forEach((track) => track.stop())
    return { access: 'granted', error: '', advice: '' }
  } catch (error) {
    const label = error instanceof DOMException ? `${error.name}${error.message ? ` : ${error.message}` : ''}` : String(error)
    return { access: isCameraDenied(error) ? 'denied' : 'unavailable', error: label, advice: adviceFor(error, browserInfo()) }
  }
}
