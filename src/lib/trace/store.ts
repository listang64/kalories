import { create } from 'zustand'

export interface Placement {
  x: number
  y: number
  scale: number
  rotation: number
}

export const CENTER: Placement = { x: 0, y: 0, scale: 1, rotation: 0 }
export const SCALE_MIN = 0.1
export const SCALE_MAX = 6

export const clampScale = (scale: number) => Math.min(SCALE_MAX, Math.max(SCALE_MIN, scale))

export function wrapAngle(degrees: number): number {
  const turn = (((degrees + 180) % 360) + 360) % 360
  return turn - 180
}

interface TraceState {
  image: string | null
  placement: Placement
  opacity: number
  mirror: boolean
  contrast: boolean
  locked: boolean
  setImage: (file: File) => void
  place: (placement: Placement) => void
  set: (patch: Partial<Pick<TraceState, 'opacity' | 'mirror' | 'contrast' | 'locked'>>) => void
}

export const useTraceStore = create<TraceState>()((set, get) => ({
  image: null,
  placement: CENTER,
  opacity: 0.5,
  mirror: false,
  contrast: false,
  locked: false,
  setImage: (file) => {
    const previous = get().image
    if (previous) URL.revokeObjectURL(previous)
    set({ image: URL.createObjectURL(file), placement: CENTER, locked: false })
  },
  place: (placement) => set({ placement }),
  set: (patch) => set(patch),
}))
