import { useId } from 'react'
import { ratio } from '../../lib/nutrition'
import { ARC_THICKNESS, arcGeometry, type ArcSide } from './arcGeometry'

interface Props {
  side: ArcSide
  value: number
  goal: number
  colorA: string
  colorB: string
  size: number
  label: string
}

const FILL_TRANSITION = 'stroke-dashoffset 1.2s cubic-bezier(0.22, 1.25, 0.36, 1)'

export function ArcGauge({ side, value, goal, colorA, colorB, size, label }: Props) {
  const id = useId()
  const geo = arcGeometry(side, size)
  const level = ratio(value, goal)
  const fill = Math.min(Math.max(level, 0), 1)
  const over = level > 1
  const stroke = {
    d: geo.d,
    fill: 'none',
    strokeWidth: ARC_THICKNESS,
    strokeLinecap: 'round' as const,
  }
  const liquid = {
    ...stroke,
    stroke: `url(#${id}g)`,
    strokeDasharray: geo.length,
    strokeDashoffset: geo.length * (1 - fill),
    opacity: fill > 0 ? 1 : 0,
    style: { transition: FILL_TRANSITION },
  }

  return (
    <svg width={size / 2} height={size} role="img" aria-label={label} overflow="visible">
      <defs>
        <linearGradient id={`${id}g`} gradientUnits="userSpaceOnUse" x1="0" y1={geo.bottom} x2="0" y2={geo.top}>
          <stop offset="0" stopColor={colorA} />
          <stop offset={over ? 0.72 : 1} stopColor={colorB} />
          {over && <stop offset="1" stopColor="var(--accent)" />}
        </linearGradient>
        <filter id={`${id}h`} x="-60%" y="-20%" width="220%" height="140%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>
      <path {...stroke} stroke="rgba(255,255,255,0.06)" />
      <path {...liquid} filter={`url(#${id}h)`} opacity={fill > 0 ? 0.45 : 0} />
      <path {...liquid} />
    </svg>
  )
}
