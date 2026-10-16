import { useCallback, useState } from 'react'

let available: boolean | null = null

function detect(): boolean {
  if (new URLSearchParams(window.location.search).has('svg')) return false
  const gl = document.createElement('canvas').getContext('webgl')
  gl?.getExtension('WEBGL_lose_context')?.loseContext()
  return gl !== null
}

export function useFluidSupport() {
  const [enabled, setEnabled] = useState(() => (available ??= detect()))
  const fail = useCallback(() => setEnabled(false), [])
  return { enabled, fail }
}
