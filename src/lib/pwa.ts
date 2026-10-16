import { registerSW } from 'virtual:pwa-register'
import { useAppStore } from '../store/appStore'

const CHECK_INTERVAL = 30 * 60 * 1000

export type UpdateCheck = 'found' | 'current' | 'offline' | 'unsupported'

let updateSW: ((reload?: boolean) => Promise<void>) | undefined
let registration: ServiceWorkerRegistration | undefined

export function registerPwa() {
  updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      useAppStore.getState().setUpdateReady(true)
    },
    onNeedReload() {},
    onRegisteredSW(_url, reg) {
      if (!reg) return
      registration = reg
      const check = () => {
        if (navigator.onLine) reg.update().catch(() => undefined)
      }
      setInterval(check, CHECK_INTERVAL)
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') check()
      })
    },
  })
}

export async function checkForUpdate(): Promise<UpdateCheck> {
  if (!registration) return 'unsupported'
  if (!navigator.onLine) return 'offline'
  try {
    await registration.update()
  } catch {
    return 'offline'
  }
  return registration.installing || registration.waiting ? 'found' : 'current'
}

export function applyUpdate() {
  navigator.serviceWorker?.addEventListener('controllerchange', () => window.location.reload(), {
    once: true,
  })
  void updateSW?.(true)
}

export function requestPersistentStorage() {
  void navigator.storage?.persist?.().catch(() => false)
}
