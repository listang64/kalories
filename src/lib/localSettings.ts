import { create } from 'zustand'

const KEY_STORAGE = 'kalories.geminiKey'
const MODEL_STORAGE = 'kalories.geminiModel'

export const DEFAULT_MODEL = 'gemini-flash-latest'
export const FALLBACK_MODEL = 'gemini-3.5-flash-lite'

function read(name: string): string {
  try {
    return localStorage.getItem(name) ?? ''
  } catch {
    return ''
  }
}

function write(name: string, value: string) {
  try {
    if (value) localStorage.setItem(name, value)
    else localStorage.removeItem(name)
  } catch {
    return
  }
}

interface LocalSettings {
  geminiKey: string
  geminiModel: string
  setGeminiKey: (key: string) => void
  setGeminiModel: (model: string) => void
}

export const useLocalSettings = create<LocalSettings>()((set) => ({
  geminiKey: read(KEY_STORAGE),
  geminiModel: read(MODEL_STORAGE) || DEFAULT_MODEL,
  setGeminiKey: (key) => {
    const geminiKey = key.trim()
    write(KEY_STORAGE, geminiKey)
    set({ geminiKey })
  },
  setGeminiModel: (model) => {
    const geminiModel = model.trim().replace(/^models\//, '') || DEFAULT_MODEL
    write(MODEL_STORAGE, geminiModel === DEFAULT_MODEL ? '' : geminiModel)
    set({ geminiModel })
  },
}))

export function maskKey(key: string): string {
  return `•••• ${key.slice(-4)}`
}
