import { useEffect, useRef } from 'react'
import { arcLayout, type ArcSide } from '../fluid/arcGeometry'
import { addFluid } from '../fluid/loop'
import type { Burst } from '../../hooks/useFeedBursts'
import { gaugeLevel } from '../../lib/nutrition'

export interface StreamTarget {
  sides: ArcSide[]
  goal: number
  colors: [string, string]
}

interface Props {
  size: number
  orb: number
  bursts: Burst[]
  targets: Record<string, StreamTarget>
  onDone: (id: number) => void
}

interface Point {
  x: number
  y: number
}

interface Drop {
  burst: number
  path: [Point, Point, Point]
  radius: number
  color: string
  glow: string
  reverse: boolean
  delay: number
  duration: number
}

const MAX_DPR = 2
const STEPS = [0, 0.2, 0.45, 0.7, 1]
const RADII = [0, 0.036, 0.042, 0.034, 0]
const TRAIL = 10
const TRAIL_GAP = 0.022
const SPLASH = 0.8

function seeded(seed: number) {
  let s = seed % 233280
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

function arcPoint(side: ArcSide, size: number, fill: number): Point {
  const { r, gap } = arcLayout(size)
  const sweep = fill * (Math.PI - 2 * gap)
  const t = side === 'left' ? Math.PI + gap + sweep : Math.PI - gap - sweep
  return { x: size / 2 + r * Math.sin(t), y: size / 2 - r * Math.cos(t) }
}

const ease = (u: number) => u * u * (3 - 2 * u)

function along([a, b, c]: Drop['path'], u: number): Point {
  const e = ease(u)
  const at = (p: number, q: number, r: number) => (1 - e) * (1 - e) * p + 2 * e * (1 - e) * q + e * e * r
  return { x: at(a.x, b.x, c.x), y: at(a.y, b.y, c.y) }
}

function profile(u: number) {
  const i = Math.max(1, STEPS.findIndex((step) => step >= u))
  const [s0, s1, r0, r1] = [STEPS[i - 1] ?? 0, STEPS[i] ?? 1, RADII[i - 1] ?? 0, RADII[i] ?? 0]
  return r0 + ((r1 - r0) * (u - s0)) / (s1 - s0)
}

function dropsFor(burst: Burst, side: ArcSide, target: StreamTarget, size: number, orb: number, count: number): Drop[] {
  const rand = seeded(burst.id * 31 + (side === 'left' ? 7 : 13))
  const to = gaugeLevel(burst.to, target.goal).fill
  const from = gaugeLevel(burst.from, target.goal).fill
  const reverse = burst.to < burst.from
  const span = Math.max(Math.abs(to - from), 0.06)
  const center = size / 2
  return Array.from({ length: count }, (_, i) => {
    const step = (span * (i + 0.5)) / count + (rand() - 0.5) * 0.02
    const edge = arcPoint(side, size, Math.min(0.99, Math.max(0.01, reverse ? from - step : to - span + step)))
    const core = { x: center + (rand() - 0.5) * orb * 0.4, y: center + (rand() - 0.5) * orb * 0.4 }
    const [start, end] = reverse ? [edge, core] : [core, edge]
    const dx = end.x - start.x
    const dy = end.y - start.y
    const bend = (rand() - 0.5) * 0.8
    const control = { x: start.x + dx * 0.45 - dy * bend, y: start.y + dy * 0.45 + dx * bend }
    return {
      burst: burst.id,
      path: [start, control, end],
      radius: size * (0.7 + rand() * 0.45),
      color: i % 2 ? target.colors[1] : target.colors[0],
      glow: target.colors[1],
      reverse,
      delay: (i * 0.055 + rand() * 0.06) * 1000,
      duration: (0.95 + rand() * 0.25) * 1000,
    }
  })
}

function paint(ctx: CanvasRenderingContext2D, drop: Drop, elapsed: number, glow: number) {
  const u = (elapsed - drop.delay) / drop.duration
  if (u <= 0 || u >= 1) return
  ctx.fillStyle = drop.color
  ctx.shadowColor = drop.glow
  for (let k = TRAIL; k >= 0; k--) {
    const v = u - k * TRAIL_GAP
    const r = v > 0 ? profile(v) * drop.radius * (1 - k / (TRAIL + 2)) : 0
    if (r < 0.3) continue
    const { x, y } = along(drop.path, v)
    ctx.globalAlpha = k ? 0.5 * (1 - k / (TRAIL + 1)) : 1
    ctx.shadowBlur = k ? 0 : glow
    ctx.beginPath()
    ctx.arc(x, y, r, 0, 2 * Math.PI)
    ctx.fill()
  }
  const s = drop.reverse ? u / (1 - SPLASH) : (u - SPLASH) / (1 - SPLASH)
  if (s <= 0 || s >= 1) return
  const at = drop.path[drop.reverse ? 0 : 2]
  ctx.globalAlpha = 0.45 * (1 - s)
  ctx.shadowBlur = glow
  ctx.beginPath()
  ctx.arc(at.x, at.y, drop.radius * 0.03 * (0.4 + s), 0, 2 * Math.PI)
  ctx.fill()
}

export function FeedStream({ size, orb, bursts, targets, onDone }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const started = useRef(new Map<number, number>())
  const margin = Math.round(size * 0.12)

  useEffect(() => {
    const element = canvas.current
    const ctx = element?.getContext('2d')
    if (!element || !ctx || bursts.length === 0) return
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
    const pixels = Math.round((size + 2 * margin) * dpr)
    if (element.width !== pixels) element.width = element.height = pixels
    const glow = Math.max(4, size * 0.025) * dpr
    const live = new Set(bursts.map((burst) => burst.id))
    started.current.forEach((_, id) => !live.has(id) && started.current.delete(id))
    const drops = bursts.flatMap((burst) => {
      const target = targets[burst.uid]
      if (!target) return []
      const count = target.sides.length > 1 ? 8 : 14
      return target.sides.flatMap((side) => dropsFor(burst, side, target, size, orb, count))
    })
    const ends = new Map<number, number>()
    drops.forEach((drop) => ends.set(drop.burst, Math.max(ends.get(drop.burst) ?? 0, drop.delay + drop.duration)))
    const finished = new Set<number>()

    return addFluid({
      frame() {
        const now = performance.now()
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.clearRect(0, 0, pixels, pixels)
        ctx.setTransform(dpr, 0, 0, dpr, margin * dpr, margin * dpr)
        bursts.forEach((burst) => !started.current.has(burst.id) && started.current.set(burst.id, now))
        drops.forEach((drop) => paint(ctx, drop, now - (started.current.get(drop.burst) ?? now), glow))
        bursts.forEach((burst) => {
          const elapsed = now - (started.current.get(burst.id) ?? now)
          if (finished.has(burst.id) || elapsed < (ends.get(burst.id) ?? 0)) return
          finished.add(burst.id)
          onDone(burst.id)
        })
      },
    })
  }, [bursts, size, orb, targets, onDone, margin])

  if (bursts.length === 0) return null

  return (
    <canvas
      ref={canvas}
      aria-hidden="true"
      className="pointer-events-none absolute"
      style={{ left: -margin, top: -margin, width: size + 2 * margin, height: size + 2 * margin }}
    />
  )
}
