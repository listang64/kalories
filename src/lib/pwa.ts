import { registerSW } from 'virtual:pwa-register'
import { useAppStore } from '../store/appStore'

const CHECK_INTERVAL = 30 * 60 * 1000

let updateSW: ((reload?: boolean) => Promise<void>) | undefined

export function registerPwa() {
  updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      useAppStore.getState().setUpdateReady(true)
    },
    onNeedReload() {},
    onRegisteredSW(_url, reg) {
      if (!reg) return
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

export function applyUpdate() {
  navigator.serviceWorker?.addEventListener('controllerchange', () => window.location.reload(), {
    once: true,
  })
  void updateSW?.(true)
}

export function requestPersistentStorage() {
  void navigator.storage?.persist?.().catch(() => false)
}
