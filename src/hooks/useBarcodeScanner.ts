import { useEffect, useRef, useState, type RefObject } from 'react'
import { BARCODE, createDetector, type Detector } from '../lib/barcode'

const INTERVAL = 200

export function useBarcodeScanner(
  videoRef: RefObject<HTMLVideoElement | null>,
  active: boolean,
  onCode: (code: string) => void,
) {
  const [failed, setFailed] = useState(false)
  const latest = useRef(onCode)
  latest.current = onCode

  useEffect(() => {
    if (!active) return
    let stopped = false
    let timer = 0
    let detector: Detector | null = null

    const tick = async () => {
      const video = videoRef.current
      if (detector && video && video.readyState >= 2) {
        const found = await detector.detect(video).catch(() => [])
        const code = found.map((barcode) => barcode.rawValue).find((value) => BARCODE.test(value))
        if (stopped) return
        if (code) return latest.current(code)
      }
      timer = window.setTimeout(() => void tick(), INTERVAL)
    }

    setFailed(false)
    createDetector()
      .then((next) => {
        detector = next
        if (!stopped) void tick()
      })
      .catch(() => setFailed(true))
    return () => {
      stopped = true
      window.clearTimeout(timer)
    }
  }, [active, videoRef])

  return { failed }
}
