import { create } from 'zustand'
import { probableMealType, type MealType } from '../config/meals'
import type { MealItem } from '../lib/nutrition'

export type Overlay = 'settings' | 'add' | 'day'
export type AddStep = 'type' | 'capture' | 'analyzing' | 'review'

export interface DraftPhoto {
  id: string
  src: string
}

export interface MealDraft {
  type: MealType
  note: string
  photos: DraftPhoto[]
}

export interface ReviewItem extends MealItem {
  id: string
}

export interface AnalysisError {
  message: string
  action: 'retry' | 'settings' | null
}

const MAX_PHOTOS = 6

const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

function emptyDraft(type?: MealType): MealDraft {
  return { type: type ?? probableMealType(), note: '', photos: [] }
}

const resetFlow = (type?: MealType) => ({
  addStep: 'type' as AddStep,
  draft: emptyDraft(type),
  review: [] as ReviewItem[],
  reviewDirty: false,
  analysisError: null,
})

interface AppState {
  overlay: Overlay | null
  settingsOnTop: boolean
  updateReady: boolean
  toast: string | null
  session: number
  addStep: AddStep
  draft: MealDraft
  review: ReviewItem[]
  reviewDirty: boolean
  analysisError: AnalysisError | null
  setOverlay: (overlay: Overlay | null) => void
  openSettingsOnTop: () => void
  closeSettings: () => void
  setUpdateReady: (ready: boolean) => void
  showToast: (message: string) => void
  hideToast: () => void
  openAdd: (type?: MealType) => void
  setAddStep: (step: AddStep) => void
  chooseMealType: (type: MealType) => void
  setMealType: (type: MealType) => void
  setNote: (note: string) => void
  addPhoto: (src: string) => boolean
  removePhoto: (id: string) => void
  setAnalysisError: (error: AnalysisError | null) => void
  cancelAnalysis: () => void
  startReview: (items: MealItem[]) => void
  appendItems: (items: MealItem[]) => void
  updateItem: (id: string, patch: Partial<MealItem>) => void
  removeItem: (id: string) => void
}

export const useAppStore = create<AppState>()((set, get) => ({
  overlay: null,
  settingsOnTop: false,
  updateReady: false,
  toast: null,
  session: 0,
  ...resetFlow(),
  setOverlay: (overlay) => set((s) => (overlay === null ? { overlay, session: s.session + 1 } : { overlay })),
  openSettingsOnTop: () => set({ settingsOnTop: true }),
  closeSettings: () => (get().settingsOnTop ? set({ settingsOnTop: false, analysisError: null }) : get().setOverlay(null)),
  setUpdateReady: (updateReady) => set({ updateReady }),
  showToast: (toast) => set({ toast }),
  hideToast: () => set({ toast: null }),
  openAdd: (type) => set((s) => ({ overlay: 'add', session: s.session + 1, ...resetFlow(type) })),
  setAddStep: (addStep) => set({ addStep }),
  chooseMealType: (type) => set((s) => ({ addStep: 'capture', draft: { ...s.draft, type } })),
  setMealType: (type) => set((s) => ({ draft: { ...s.draft, type }, reviewDirty: true })),
  setNote: (note) => set((s) => ({ draft: { ...s.draft, note }, analysisError: null })),
  addPhoto: (src) => {
    if (get().draft.photos.length >= MAX_PHOTOS) return false
    set((s) => ({ draft: { ...s.draft, photos: [...s.draft.photos, { id: newId(), src }] }, analysisError: null }))
    return true
  },
  removePhoto: (id) =>
    set((s) => ({ draft: { ...s.draft, photos: s.draft.photos.filter((photo) => photo.id !== id) } })),
  setAnalysisError: (analysisError) => set({ analysisError }),
  cancelAnalysis: () => set((s) => ({ session: s.session + 1, addStep: 'capture' })),
  startReview: (items) =>
    set({ addStep: 'review', review: items.map((item) => ({ ...item, id: newId() })), reviewDirty: false }),
  appendItems: (items) =>
    set((s) => ({ review: [...s.review, ...items.map((item) => ({ ...item, id: newId() }))], reviewDirty: true })),
  updateItem: (id, patch) =>
    set((s) => ({ review: s.review.map((item) => (item.id === id ? { ...item, ...patch } : item)), reviewDirty: true })),
  removeItem: (id) => set((s) => ({ review: s.review.filter((item) => item.id !== id), reviewDirty: true })),
}))
