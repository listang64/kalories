import { useCallback } from 'react'
import { analyzeMeal } from '../lib/analysis'
import { GeminiError, geminiErrorMessage } from '../lib/gemini'
import { useLocalSettings } from '../lib/localSettings'
import { useAppStore } from '../store/appStore'

const SETTINGS_ERRORS = ['no-key', 'invalid-key', 'model']

function needsSettings(error: unknown): boolean {
  return error instanceof GeminiError && SETTINGS_ERRORS.includes(error.kind)
}

export function useAnalyzeMeal() {
  return useCallback(async () => {
    const store = useAppStore.getState()
    const { geminiKey, geminiModel } = useLocalSettings.getState()
    const { session, draft } = store
    const stale = () => useAppStore.getState().session !== session
    store.setAnalysisError(null)
    store.setAddStep('analyzing')
    try {
      const request = { type: draft.type, note: draft.note, photos: draft.photos.map((photo) => photo.src) }
      const result = await analyzeMeal(request, geminiKey, geminiModel)
      if (stale()) return
      if (result.items.length > 0) return useAppStore.getState().startReview(result.items)
      useAppStore.getState().setAddStep('capture')
      useAppStore.getState().setAnalysisError({
        message: result.comment || 'Aucun aliment reconnu : ajoute une description ou une autre photo.',
        action: null,
      })
    } catch (error) {
      if (stale()) return
      useAppStore.getState().setAddStep('capture')
      useAppStore.getState().setAnalysisError({
        message: geminiErrorMessage(error),
        action: needsSettings(error) ? 'settings' : 'retry',
      })
    }
  }, [])
}
