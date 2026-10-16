import type { MacroKey } from '../lib/nutrition'

export interface MacroMeta {
  key: MacroKey
  label: string
  colorA: string
  colorB: string
}

export const MACROS: MacroMeta[] = [
  { key: 'carbs', label: 'Glucides', colorA: '#FF6A00', colorB: '#FFA24A' },
  { key: 'fat', label: 'Lipides', colorA: '#F2A900', colorB: '#FFD970' },
  { key: 'protein', label: 'Protéines', colorA: '#BFB4A6', colorB: '#FFFFFF' },
]
