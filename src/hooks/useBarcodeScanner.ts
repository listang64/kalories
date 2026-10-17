import { useEffect, useRef, useState, type RefObject } from 'react'
import { createDetector, PRODUCT_SCAN, type Detector, type ScanOptions } from '../lib/barcode'

const INTERVAL = 200

export function useBarcodeScanner(
  videoRef: RefObject<HTMLVideoElement | null>,
  active: boolean,
  onCode: (code: string) => void,
  options: ScanOptions = PRODUCT_SCAN,
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
        const code = found.map((barcode) => options.accept(barcode.rawValue)).find((value) => value !== null)
        if (stopped) return
        if (code) return latest.current(code)
      }
      timer = window.setTimeout(() => void tick(), INTERVAL)
    }

    setFailed(false)
    createDetector(options.formats)
      .then((next) => {
        detector = next
        if (!stopped) void tick()
      })
      .catch(() => setFailed(true))
    return () => {
      stopped = true
      window.clearTimeout(timer)
    }
  }, [active, videoRef, options])

  return { failed }
}
