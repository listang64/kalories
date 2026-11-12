import { useState } from 'react'

export function useTorch(track: MediaStreamTrack | null) {
  const [state, setState] = useState<{ track: MediaStreamTrack | null; on: boolean }>({ track: null, on: false })
  const capabilities = (track?.getCapabilities?.() ?? {}) as Record<string, unknown>
  const supported = track !== null && 'torch' in capabilities
  const on = state.track === track && state.on

  const toggle = async (): Promise<boolean> => {
    if (!track || !supported) return false
    try {
      await track.applyConstraints({ advanced: [{ torch: !on } as MediaTrackConstraintSet] })
      setState({ track, on: !on })
      return true
    } catch {
      return false
    }
  }

  return { supported, on, toggle }
}
