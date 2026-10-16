import { useEffect } from 'react'
import { applyUpdate } from '../lib/pwa'
import { useAppStore } from '../store/appStore'

const VERSION_KEY = 'kalories.version'

export function useAppUpdate() {
  const updateReady = useAppStore((s) => s.updateReady)
  const overlay = useAppStore((s) => s.overlay)
  const showToast = useAppStore((s) => s.showToast)

  useEffect(() => {
    const previous = localStorage.getItem(VERSION_KEY)
    if (previous && previous !== __APP_VERSION__) showToast('Kalories mis à jour')
    localStorage.setItem(VERSION_KEY, __APP_VERSION__)
  }, [showToast])

  useEffect(() => {
    if (updateReady && overlay === null) applyUpdate()
  }, [updateReady, overlay])
}
