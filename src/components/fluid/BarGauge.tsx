import { gaugeLevel } from '../../lib/nutrition'
import { BarSvg } from './fallback/BarSvg'
import { FluidCanvas } from './FluidCanvas'
import { useFluidSupport } from './support'

interface Props {
  value: number
  goal: number
  colorA: string
  colorB: string
  label: string
}

const GLOW = 14
const THICKNESS = 14

export function BarGauge(props: Props) {
  const { value, goal, colorA, colorB, label } = props
  const fluid = useFluidSupport()
  const { fill, over } = gaugeLevel(value, goal)

  if (!fluid.enabled) return <BarSvg {...props} />

  return (
    <div role="img" aria-label={label} className="relative h-3.5">
      <FluidCanvas
        options={{ shape: 'bar', side: 1, margin: GLOW, thickness: THICKNESS }}
        colors={[colorA, colorB]}
        fill={fill}
        over={over}
        onFail={fluid.fail}
        style={{ inset: -GLOW }}
      />
    </div>
  )
}
