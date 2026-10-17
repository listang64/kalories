export type ColorId = 'violet' | 'rouge' | 'bleu' | 'vert' | 'turquoise' | 'rose'

export interface PersonColor {
  id: ColorId
  label: string
  colorA: string
  colorB: string
  chartColor: string
}

export const COLORS: PersonColor[] = [
  { id: 'violet', label: 'Violet', colorA: '#7C3AED', colorB: '#C084FC', chartColor: '#A855F7' },
  { id: 'rouge', label: 'Rouge', colorA: '#E11D48', colorB: '#FB7185', chartColor: '#F43F5E' },
  { id: 'bleu', label: 'Bleu', colorA: '#2563EB', colorB: '#60A5FA', chartColor: '#3B82F6' },
  { id: 'vert', label: 'Vert', colorA: '#059669', colorB: '#34D399', chartColor: '#10B981' },
  { id: 'turquoise', label: 'Turquoise', colorA: '#0891B2', colorB: '#22D3EE', chartColor: '#06B6D4' },
  { id: 'rose', label: 'Rose', colorA: '#DB2777', colorB: '#F472B6', chartColor: '#EC4899' },
]

const [FALLBACK] = COLORS as [PersonColor]

export function colorById(id: unknown): PersonColor {
  return COLORS.find((color) => color.id === id) ?? FALLBACK
}
