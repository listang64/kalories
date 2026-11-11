import { useRef, type PointerEvent } from 'react'
import { clampScale, wrapAngle, type Placement } from '../lib/trace/store'

interface Point {
  x: number
  y: number
}

const middle = (a: Point, b: Point) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 })
const distance = (a: Point, b: Point) => Math.hypot(b.x - a.x, b.y - a.y)
const angle = (a: Point, b: Point) => (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI

export function usePinch(placement: Placement, onChange: (next: Placement) => void, disabled: boolean) {
  const pointers = useRef(new Map<number, Point>())
  const current = useRef(placement)
  if (pointers.current.size === 0) current.current = placement

  const update = (next: Placement) => {
    current.current = next
    onChange(next)
  }

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    if (disabled || pointers.current.size >= 2) return
    event.currentTarget.setPointerCapture(event.pointerId)
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
  }

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    const map = pointers.current
    const previous = map.get(event.pointerId)
    if (!previous || disabled) return
    const before = [...map.values()]
    map.set(event.pointerId, { x: event.clientX, y: event.clientY })
    const after = [...map.values()]
    const place = current.current
    const [a0, b0] = before
    const [a1, b1] = after
    if (!a0 || !a1) return
    if (!b0 || !b1) {
      update({ ...place, x: place.x + a1.x - a0.x, y: place.y + a1.y - a0.y })
      return
    }
    const m0 = middle(a0, b0)
    const m1 = middle(a1, b1)
    const ratio = distance(a1, b1) / Math.max(1, distance(a0, b0))
    update({
      x: place.x + m1.x - m0.x,
      y: place.y + m1.y - m0.y,
      scale: clampScale(place.scale * ratio),
      rotation: wrapAngle(place.rotation + angle(a1, b1) - angle(a0, b0)),
    })
  }

  const onPointerEnd = (event: PointerEvent<HTMLElement>) => {
    pointers.current.delete(event.pointerId)
  }

  return { onPointerDown, onPointerMove, onPointerUp: onPointerEnd, onPointerCancel: onPointerEnd }
}
