import { gaugeLevel } from '../../../lib/nutrition'

interface Props {
  value: number
  goal: number
  colorA: string
  colorB: string
  label: string
}

export function BarSvg({ value, goal, colorA, colorB, label }: Props) {
  const { fill, over } = gaugeLevel(value, goal)
  const end = over ? 'var(--accent)' : colorA

  return (
    <div role="img" aria-label={label} className="h-3.5 rounded-full bg-white/6">
      <div
        className="bar-flow h-full rounded-full transition-[width] duration-1200 ease-[cubic-bezier(0.22,1.25,0.36,1)]"
        style={{
          width: `${fill * 100}%`,
          minWidth: fill > 0 ? 14 : 0,
          backgroundImage: `linear-gradient(90deg, ${colorA}, ${colorB}, ${end})`,
          boxShadow: `0 0 14px ${colorA}55`,
        }}
      />
    </div>
  )
}
