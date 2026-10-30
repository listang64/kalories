import { create } from 'zustand'
import { probableMealType, type MealType } from '../config/meals'
import type { Meal, MealRef } from '../lib/meals'
import type { DayProgress, MealItem } from '../lib/nutrition'

export type Overlay = 'settings' | 'add' | 'day' | 'history' | 'shopping' | 'loans' | 'recipes' | 'needs' | 'watch' | 'game'
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

export interface AddTarget {
  date: string
  progress: DayProgress
}

export interface EditTarget {
  meal: MealRef
  progress: DayProgress
}

export interface AnalysisError {
  message: string
  action: 'retry' | 'settings' | null
  detail?: string
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
  addTarget: null,
  editing: null,
})

const withIds = (items: MealItem[]): ReviewItem[] => items.map((item) => ({ ...item, id: newId() }))

interface AppState {
  overlay: Overlay | null
  settingsOnTop: boolean
  settingsSection: 'camera' | null
  updateReady: boolean
  toast: string | null
  session: number
  addStep: AddStep
  draft: MealDraft
  review: ReviewItem[]
  reviewDirty: boolean
  analysisError: AnalysisError | null
  addTarget: AddTarget | null
  editing: EditTarget | null
  recipeCode: string | null
  setOverlay: (overlay: Overlay | null) => void
  openSettingsOnTop: (section?: 'camera') => void
  closeSettings: () => void
  setUpdateReady: (ready: boolean) => void
  showToast: (message: string) => void
  hideToast: () => void
  openAdd: (type?: MealType, target?: AddTarget) => void
  startEdit: (meal: Meal, progress: DayProgress, items?: MealItem[]) => void
  closeEdit: () => void
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
  settingsSection: null,
  updateReady: false,
  toast: null,
  session: 0,
  recipeCode: null,
  ...resetFlow(),
  setOverlay: (overlay) => set((s) => (overlay === null ? { overlay, session: s.session + 1 } : { overlay })),
  openSettingsOnTop: (section) => set({ settingsOnTop: true, settingsSection: section ?? null }),
  closeSettings: () => (get().settingsOnTop ? set({ settingsOnTop: false, analysisError: null }) : get().setOverlay(null)),
  setUpdateReady: (updateReady) => set({ updateReady }),
  showToast: (toast) => set({ toast }),
  hideToast: () => set({ toast: null }),
  openAdd: (type, target) =>
    set((s) => ({ overlay: 'add', session: s.session + 1, ...resetFlow(type), addTarget: target ?? null })),
  startEdit: (meal, progress, items) =>
    set((s) => ({
      session: s.session + 1,
      ...resetFlow(meal.type),
      addStep: 'review',
      draft: { type: meal.type, note: meal.note, photos: [] },
      review: withIds(items ?? meal.items),
      reviewDirty: items !== undefined,
      editing: { meal: { id: meal.id, uid: meal.uid }, progress },
    })),
  closeEdit: () => set((s) => ({ editing: null, session: s.session + 1 })),
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
  startReview: (items) => set({ addStep: 'review', review: withIds(items), reviewDirty: false }),
  appendItems: (items) => set((s) => ({ review: [...s.review, ...withIds(items)], reviewDirty: true })),
  updateItem: (id, patch) =>
    set((s) => ({ review: s.review.map((item) => (item.id === id ? { ...item, ...patch } : item)), reviewDirty: true })),
  removeItem: (id) => set((s) => ({ review: s.review.filter((item) => item.id !== id), reviewDirty: true })),
}))
