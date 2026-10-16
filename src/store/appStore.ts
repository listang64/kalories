import { create } from 'zustand'

export type Overlay = 'settings' | 'add' | 'day'

interface AppState {
  overlay: Overlay | null
  updateReady: boolean
  toast: string | null
  setOverlay: (overlay: Overlay | null) => void
  setUpdateReady: (ready: boolean) => void
  showToast: (message: string) => void
  hideToast: () => void
}

export const useAppStore = create<AppState>()((set) => ({
  overlay: null,
  updateReady: false,
  toast: null,
  setOverlay: (overlay) => set({ overlay }),
  setUpdateReady: (updateReady) => set({ updateReady }),
  showToast: (toast) => set({ toast }),
  hideToast: () => set({ toast: null }),
}))
