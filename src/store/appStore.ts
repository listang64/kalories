import { create } from 'zustand'
import { probableMealType, type MealType } from '../config/meals'

export type Overlay = 'settings' | 'add' | 'day'
export type AddStep = 'type' | 'capture'

export interface DraftPhoto {
  id: string
  src: string
}

export interface MealDraft {
  type: MealType
  note: string
  photos: DraftPhoto[]
}

const MAX_PHOTOS = 6

function emptyDraft(type?: MealType): MealDraft {
  return { type: type ?? probableMealType(), note: '', photos: [] }
}

interface AppState {
  overlay: Overlay | null
  updateReady: boolean
  toast: string | null
  addStep: AddStep
  draft: MealDraft
  setOverlay: (overlay: Overlay | null) => void
  setUpdateReady: (ready: boolean) => void
  showToast: (message: string) => void
  hideToast: () => void
  openAdd: (type?: MealType) => void
  chooseMealType: (type: MealType) => void
  backToMealType: () => void
  setNote: (note: string) => void
  addPhoto: (src: string) => boolean
  removePhoto: (id: string) => void
}

export const useAppStore = create<AppState>()((set, get) => ({
  overlay: null,
  updateReady: false,
  toast: null,
  addStep: 'type',
  draft: emptyDraft(),
  setOverlay: (overlay) => set(overlay === null ? { overlay, draft: emptyDraft() } : { overlay }),
  setUpdateReady: (updateReady) => set({ updateReady }),
  showToast: (toast) => set({ toast }),
  hideToast: () => set({ toast: null }),
  openAdd: (type) => set({ overlay: 'add', addStep: 'type', draft: emptyDraft(type) }),
  chooseMealType: (type) => set((s) => ({ addStep: 'capture', draft: { ...s.draft, type } })),
  backToMealType: () => set({ addStep: 'type' }),
  setNote: (note) => set((s) => ({ draft: { ...s.draft, note } })),
  addPhoto: (src) => {
    if (get().draft.photos.length >= MAX_PHOTOS) return false
    const photo = { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, src }
    set((s) => ({ draft: { ...s.draft, photos: [...s.draft.photos, photo] } }))
    return true
  },
  removePhoto: (id) =>
    set((s) => ({ draft: { ...s.draft, photos: s.draft.photos.filter((photo) => photo.id !== id) } })),
}))
