import { useEffect, useRef, useState } from 'react'
import { isCameraDenied } from '../lib/camera'

export type CameraState = 'starting' | 'ready' | 'denied' | 'unavailable'

const CONSTRAINTS: MediaStreamConstraints = {
  video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 } },
  audio: false,
}

export function useCamera(active: boolean) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [state, setState] = useState<CameraState>('starting')

  useEffect(() => {
    if (!active) return
    let stream: MediaStream | null = null
    let generation = 0

    const stop = () => {
      generation += 1
      stream?.getTracks().forEach((track) => track.stop())
      stream = null
      if (videoRef.current) videoRef.current.srcObject = null
    }

    const start = async () => {
      stop()
      const id = generation
      if (!navigator.mediaDevices?.getUserMedia) return setState('unavailable')
      setState('starting')
      try {
        const next = await navigator.mediaDevices.getUserMedia(CONSTRAINTS)
        if (id !== generation) return next.getTracks().forEach((track) => track.stop())
        stream = next
        const video = videoRef.current
        if (video) {
          video.srcObject = next
          await video.play().catch(() => undefined)
        }
        setState('ready')
      } catch (error) {
        if (id === generation) setState(isCameraDenied(error) ? 'denied' : 'unavailable')
      }
    }

    const onVisibility = () => (document.hidden ? stop() : void start())
    void start()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      stop()
    }
  }, [active])

  return { videoRef, state }
}
