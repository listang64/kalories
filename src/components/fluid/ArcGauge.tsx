import { gaugeLevel } from '../../lib/nutrition'
import { ARC_THICKNESS, type ArcSide } from './arcGeometry'
import { ArcSvg } from './fallback/ArcSvg'
import { FluidCanvas } from './FluidCanvas'
import { useFluidSupport } from './support'

interface Props {
  side: ArcSide
  value: number
  goal: number
  colorA: string
  colorB: string
  size: number
  label: string
}

const GLOW = 20

export function ArcGauge(props: Props) {
  const { side, value, goal, colorA, colorB, size, label } = props
  const fluid = useFluidSupport()
  const { fill, over } = gaugeLevel(value, goal)
  const width = size / 2

  if (!fluid.enabled) return <ArcSvg {...props} />

  return (
    <div role="img" aria-label={label} className="relative" style={{ width, height: size }}>
      <FluidCanvas
        options={{ shape: 'arc', side: side === 'left' ? -1 : 1, margin: GLOW, thickness: ARC_THICKNESS }}
        colors={[colorA, colorB]}
        fill={fill}
        over={over}
        onFail={fluid.fail}
        style={{ left: -GLOW, top: -GLOW, width: width + 2 * GLOW, height: size + 2 * GLOW }}
      />
    </div>
  )
}
