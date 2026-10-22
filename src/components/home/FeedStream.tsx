import { useId } from 'react'
import { motion } from 'motion/react'
import { arcLayout, type ArcSide } from '../fluid/arcGeometry'
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

interface Drop {
  key: string
  xs: number[]
  ys: number[]
  rs: number[]
  color: string
  delay: number
  duration: number
}

const STEPS = [0, 0.2, 0.45, 0.7, 1]
const RADII = [0, 0.036, 0.042, 0.034, 0.016]

function seeded(seed: number) {
  let s = seed % 233280
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

function arcPoint(side: ArcSide, size: number, fill: number) {
  const { r, gap } = arcLayout(size)
  const sweep = fill * (Math.PI - 2 * gap)
  const t = side === 'left' ? Math.PI + gap + sweep : Math.PI - gap - sweep
  return { x: size / 2 + r * Math.sin(t), y: size / 2 - r * Math.cos(t) }
}

function dropsFor(burst: Burst, side: ArcSide, target: StreamTarget, size: number, orb: number, count: number): Drop[] {
  const rand = seeded(burst.id * 31 + (side === 'left' ? 7 : 13))
  const to = gaugeLevel(burst.to, target.goal).fill
  const from = gaugeLevel(burst.from, target.goal).fill
  const span = Math.max(to - from, 0.06)
  const center = size / 2
  return Array.from({ length: count }, (_, i) => {
    const t = Math.min(0.99, Math.max(0.01, to - span + (span * (i + 0.5)) / count + (rand() - 0.5) * 0.02))
    const end = arcPoint(side, size, t)
    const start = { x: center + (rand() - 0.5) * orb * 0.4, y: center + (rand() - 0.5) * orb * 0.4 }
    const dx = end.x - start.x
    const dy = end.y - start.y
    const bend = (rand() - 0.5) * 0.8
    const control = { x: start.x + dx * 0.45 - dy * bend, y: start.y + dy * 0.45 + dx * bend }
    const at = (u: number, a: number, b: number, c: number) => (1 - u) * (1 - u) * a + 2 * u * (1 - u) * b + u * u * c
    const scale = 0.7 + rand() * 0.45
    return {
      key: `${burst.id}-${side}-${i}`,
      xs: STEPS.map((u) => at(u, start.x, control.x, end.x)),
      ys: STEPS.map((u) => at(u, start.y, control.y, end.y)),
      rs: RADII.map((r) => r * size * scale),
      color: i % 2 ? target.colors[1] : target.colors[0],
      delay: i * 0.055 + rand() * 0.06,
      duration: 0.95 + rand() * 0.25,
    }
  })
}

export function FeedStream({ size, orb, bursts, targets, onDone }: Props) {
  const id = useId()
  const blur = Math.max(2.5, size * 0.012)

  return (
    <svg aria-hidden="true" width={size} height={size} className="pointer-events-none absolute inset-0 overflow-visible">
      <defs>
        <filter id={`${id}goo`} filterUnits="userSpaceOnUse" x={-size * 0.1} y={-size * 0.1} width={size * 1.2} height={size * 1.2}>
          <feGaussianBlur in="SourceGraphic" stdDeviation={blur} result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8" result="goo" />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </defs>
      {bursts.map((burst) => {
        const target = targets[burst.uid]
        if (!target) return null
        const drops = target.sides.flatMap((side) =>
          dropsFor(burst, side, target, size, orb, target.sides.length > 1 ? 8 : 14),
        )
        const last = drops.reduce<Drop | null>((a, b) => (a && a.delay + a.duration >= b.delay + b.duration ? a : b), null)
        return (
          <g key={burst.id} style={{ filter: `drop-shadow(0 0 ${blur * 1.6}px ${target.colors[1]})` }}>
            <g filter={`url(#${id}goo)`}>
              {drops.map((drop) => (
                <motion.circle
                  key={drop.key}
                  fill={drop.color}
                  initial={{ cx: drop.xs[0], cy: drop.ys[0], r: 0 }}
                  animate={{ cx: drop.xs, cy: drop.ys, r: drop.rs }}
                  transition={{ duration: drop.duration, delay: drop.delay, ease: [0.45, 0, 0.3, 1], times: STEPS }}
                  onAnimationComplete={drop === last ? () => onDone(burst.id) : undefined}
                />
              ))}
            </g>
          </g>
        )
      })}
    </svg>
  )
}
