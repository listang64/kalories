import { create } from 'zustand'

const KEY_STORAGE = 'kalories.geminiKey'
const MODEL_STORAGE = 'kalories.geminiModel'

export const DEFAULT_MODEL = 'gemini-flash-latest'
export const FALLBACK_MODEL = 'gemini-3.5-flash-lite'

export function cleanKey(key: string): string {
  return key.replace(/[^A-Za-z0-9_-]/g, '')
}

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
  geminiKey: cleanKey(read(KEY_STORAGE)),
  geminiModel: read(MODEL_STORAGE) || DEFAULT_MODEL,
  setGeminiKey: (key) => {
    const geminiKey = cleanKey(key)
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
  return `${key.slice(0, 4)}…${key.slice(-4)}`
}

export function looksLikeGeminiKey(key: string): boolean {
  return /^AIza[0-9A-Za-z_-]{35}$/.test(key)
}
