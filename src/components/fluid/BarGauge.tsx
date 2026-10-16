import { ratio } from '../../lib/nutrition'

interface Props {
  value: number
  goal: number
  colorA: string
  colorB: string
  label: string
}

export function BarGauge({ value, goal, colorA, colorB, label }: Props) {
  const level = ratio(value, goal)
  const fill = Math.min(Math.max(level, 0), 1)
  const end = level > 1 ? `${colorB} 78%, var(--accent)` : colorB

  return (
    <div role="img" aria-label={label} className="h-3.5 rounded-full bg-white/6">
      <div
        className="h-full rounded-full transition-[width] duration-1200 ease-[cubic-bezier(0.22,1.25,0.36,1)]"
        style={{
          width: `${fill * 100}%`,
          minWidth: fill > 0 ? 14 : 0,
          background: `linear-gradient(90deg, ${colorA}, ${end})`,
          boxShadow: `0 0 14px ${colorA}55`,
        }}
      />
    </div>
  )
}
