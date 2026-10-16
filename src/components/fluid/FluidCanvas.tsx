import { useEffect, useLayoutEffect, useRef, type CSSProperties } from 'react'
import { createFluidGauge, type FluidGauge, type FluidOptions } from './fluidGauge'

interface Props {
  options: FluidOptions
  colors: string[]
  fill?: number
  over?: boolean
  style: CSSProperties
  onFail: () => void
  onReady?: (gauge: FluidGauge | null) => void
}

export function FluidCanvas({ options, colors, fill = 1, over = false, style, onFail, onReady }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const gaugeRef = useRef<FluidGauge | null>(null)
  const latest = useRef({ colors, fill, over, onFail, onReady })
  latest.current = { colors, fill, over, onFail, onReady }
  const { shape, side, margin, thickness, spin } = options

  useLayoutEffect(() => {
    const host = hostRef.current
    if (!host) return
    const canvas = document.createElement('canvas')
    canvas.style.cssText = 'display:block;width:100%;height:100%'
    host.appendChild(canvas)
    const gauge = createFluidGauge(canvas, { shape, side, margin, thickness, spin })
    if (!gauge) {
      canvas.remove()
      latest.current.onFail()
      return
    }
    gauge.setColors(latest.current.colors)
    gauge.setTarget(latest.current.fill, latest.current.over)
    gaugeRef.current = gauge
    latest.current.onReady?.(gauge)
    const observer = new ResizeObserver(([entry]) => {
      if (entry) gauge.resize(entry.contentRect.width, entry.contentRect.height)
    })
    observer.observe(host)
    return () => {
      observer.disconnect()
      gauge.dispose()
      canvas.remove()
      gaugeRef.current = null
      latest.current.onReady?.(null)
    }
  }, [shape, side, margin, thickness, spin])

  const colorKey = colors.join()
  useEffect(() => {
    gaugeRef.current?.setColors(latest.current.colors)
  }, [colorKey])

  useEffect(() => {
    gaugeRef.current?.setTarget(fill, over)
  }, [fill, over])

  return <div ref={hostRef} aria-hidden="true" className="pointer-events-none absolute" style={style} />
}
