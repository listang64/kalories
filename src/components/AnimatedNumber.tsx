import { useEffect, useRef, useState } from 'react'
import { animate, useReducedMotion } from 'motion/react'
import { formatInt } from '../lib/format'

export function AnimatedNumber({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const shown = useRef(value)
  const [initial] = useState(() => formatInt(value))
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const controls = animate(shown.current, value, {
      duration: reduced ? 0 : 0.55,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        shown.current = v
        el.textContent = formatInt(v)
      },
    })
    return () => controls.stop()
  }, [value, reduced])

  return (
    <span ref={ref} className="tabular-nums">
      {initial}
    </span>
  )
}
