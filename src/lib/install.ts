import { create } from 'zustand'

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface InstallState {
  prompt: InstallPromptEvent | null
  installed: boolean
  dismissed: boolean
}

export type InstallBannerMode = 'prompt' | 'manual' | null

const DISMISS_KEY = 'kalories.install-dismissed'

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    (navigator as { standalone?: boolean }).standalone === true
  )
}

function wasDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISS_KEY) === '1'
  } catch {
    return false
  }
}

const useInstall = create<InstallState>()(() => ({ prompt: null, installed: isStandalone(), dismissed: wasDismissed() }))

export function watchInstall() {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    useInstall.setState({ prompt: event as InstallPromptEvent })
  })
  window.addEventListener('appinstalled', () => useInstall.setState({ prompt: null, installed: true }))
}

export async function install() {
  const { prompt } = useInstall.getState()
  if (!prompt) return
  await prompt.prompt()
  const { outcome } = await prompt.userChoice
  useInstall.setState({ prompt: null, installed: outcome === 'accepted' })
}

export function dismissInstall() {
  useInstall.setState({ dismissed: true })
  try {
    localStorage.setItem(DISMISS_KEY, '1')
  } catch {
    return
  }
}

export function useInstallBanner(): InstallBannerMode {
  const { prompt, installed, dismissed } = useInstall()
  if (installed || dismissed) return null
  if (prompt) return 'prompt'
  return /Android/i.test(navigator.userAgent) ? 'manual' : null
}
