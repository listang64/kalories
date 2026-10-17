import { useState, type KeyboardEvent, type PointerEvent } from 'react'
import { motion } from 'motion/react'
import { useElementSize } from '../../hooks/useElementSize'
import { formatInt } from '../../lib/format'
import { formatShortDate } from '../../lib/dates'
import { valueOf, type DayPoint } from '../../lib/history'
import { chartScale, monotonePath, runs, type Point } from './chartMath'
import { ChartTooltip, TOOLTIP_WIDTH } from './ChartTooltip'

export interface ChartSeries {
  id: string
  name: string
  color: string
  goal: number
}

interface Props {
  points: DayPoint[]
  series: ChartSeries[]
  height?: number
}

const DEFAULT_HEIGHT = 270
const NARROW = 260
const PAD = { top: 18, right: 10, bottom: 24, left: 40 }
const SURFACE = 'var(--surface)'

export function HistoryChart({ points, series, height = DEFAULT_HEIGHT }: Props) {
  const [ref, { width }] = useElementSize<HTMLDivElement>()
  const [active, setActive] = useState<number | null>(null)
  const n = points.length
  const innerW = Math.max(1, width - PAD.left - PAD.right)
  const innerH = height - PAD.top - PAD.bottom
  const values = points.flatMap((p) => series.map((s) => valueOf(p, s.id) ?? 0))
  const { max, ticks } = chartScale(Math.max(1500, ...values, ...series.map((s) => s.goal)))
  const x = (i: number) => PAD.left + (n > 1 ? (i / (n - 1)) * innerW : innerW / 2)
  const y = (v: number) => PAD.top + innerH * (1 - v / max)
  const baseline = y(0)
  const point = active === null ? undefined : points[active]
  const marks = innerW < NARROW ? [0, 14, n - 1] : [0, 7, 14, 21, n - 1]

  const pick = (event: PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const index = Math.round(((event.clientX - rect.left - PAD.left) / innerW) * (n - 1))
    setActive(Math.min(n - 1, Math.max(0, index)))
  }

  const step = (event: KeyboardEvent<SVGSVGElement>) => {
    const delta = event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0
    if (!delta) return
    event.preventDefault()
    setActive((current) => Math.min(n - 1, Math.max(0, (current ?? n - 1) + delta)))
  }

  return (
    <div ref={ref} className="relative">
      {width > 0 && (
        <svg
          width={width}
          height={height}
          role="img"
          tabIndex={0}
          aria-label="Courbe des calories des 30 derniers jours, avec les plafonds"
          onPointerDown={pick}
          onPointerMove={(e) => (e.pointerType === 'mouse' || e.buttons > 0 ? pick(e) : undefined)}
          onKeyDown={step}
          className="touch-pan-y outline-none select-none"
        >
          <defs>
            {series.map((s) => (
              <linearGradient key={s.id} id={`area-${s.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={s.color} stopOpacity="0.13" />
                <stop offset="0.85" stopColor={s.color} stopOpacity="0" />
              </linearGradient>
            ))}
          </defs>
          {ticks.map((tick) => (
            <g key={tick}>
              <line x1={PAD.left} x2={width - PAD.right} y1={y(tick)} y2={y(tick)} stroke="var(--line)" />
              <text x={PAD.left - 8} y={y(tick) + 4} textAnchor="end" className="fill-text-2 text-[11px] tabular-nums">
                {formatInt(tick)}
              </text>
            </g>
          ))}
          {marks.map((i, k, all) => (
            <text
              key={i}
              x={x(i)}
              y={height - 6}
              textAnchor={k === 0 ? 'start' : k === all.length - 1 ? 'end' : 'middle'}
              className="fill-text-2 text-[11px]"
            >
              {k === all.length - 1 ? 'Auj.' : formatShortDate(points[i]?.date ?? '')}
            </text>
          ))}
          {series.map((s) => (
            <line
              key={`goal-${s.id}`}
              x1={PAD.left}
              x2={width - PAD.right}
              y1={y(s.goal)}
              y2={y(s.goal)}
              stroke={s.color}
              strokeOpacity="0.75"
              strokeWidth="1.25"
              strokeDasharray="3 5"
            />
          ))}
          {series.map((s) =>
            runs(points.map((p, i) => (valueOf(p, s.id) === null ? null : ([x(i), y(valueOf(p, s.id) ?? 0)] as Point)))).map(
              ({ start, items }) => {
                const line = monotonePath(items)
                const last = items[items.length - 1]
                const area = last ? `${line}L${last[0]},${baseline}L${items[0]?.[0] ?? 0},${baseline}Z` : ''
                return (
                  <g key={`${s.id}-${start}`}>
                    {items.length > 1 && (
                      <motion.path
                        d={area}
                        fill={`url(#area-${s.id})`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                      />
                    )}
                    {items.length > 1 ? (
                      <motion.path
                        d={line}
                        fill="none"
                        stroke={s.color}
                        strokeWidth="2.25"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                      />
                    ) : (
                      <circle cx={items[0]?.[0]} cy={items[0]?.[1]} r="3.5" fill={s.color} />
                    )}
                  </g>
                )
              },
            ),
          )}
          {point && (
            <line x1={x(active ?? 0)} x2={x(active ?? 0)} y1={PAD.top - 6} y2={baseline} stroke="rgba(255,255,255,0.3)" />
          )}
          {series.map((s) => {
            const index = point ? (active ?? 0) : lastIndex(points, s.id)
            const value = index === null ? null : (points[index]?.values[s.id] ?? null)
            if (index === null || value === null) return null
            return (
              <circle
                key={`dot-${s.id}`}
                cx={x(index)}
                cy={y(value)}
                r="4.5"
                fill={value > s.goal ? 'var(--accent)' : s.color}
                stroke={SURFACE}
                strokeWidth="2"
              />
            )
          })}
        </svg>
      )}
      {point && (
        <ChartTooltip
          point={point}
          series={series}
          left={Math.min(Math.max(x(active ?? 0) - TOOLTIP_WIDTH / 2, 0), width - TOOLTIP_WIDTH)}
        />
      )}
    </div>
  )
}

function lastIndex(points: DayPoint[], id: string): number | null {
  for (let i = points.length - 1; i >= 0; i -= 1) if ((points[i]?.values[id] ?? null) !== null) return i
  return null
}
