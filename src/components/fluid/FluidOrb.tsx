import { useRef } from 'react'
import { colorById } from '../../config/colors'
import { useSession } from '../../store/sessionStore'
import { OrbCss } from './fallback/OrbCss'
import { FluidCanvas } from './FluidCanvas'
import type { FluidGauge } from './fluidGauge'
import { useFluidSupport } from './support'

interface Props {
  size: number
  label: string
  onPress?: () => void
  spin?: number
}

const GLOW_RATIO = 0.34
const OPEN_DELAY = 220
const BRAND = [colorById('violet'), colorById('rouge')] as const

function useOrbColors(): string[] {
  const people = useSession((s) => s.people)
  const [first, second] = people[0] ? [people[0], people[1] ?? people[0]] : BRAND
  return [first.colorA, first.colorB, second.colorA, second.colorB]
}

export function FluidOrb({ size, label, onPress, spin = 1 }: Props) {
  const fluid = useFluidSupport()
  const gauge = useRef<FluidGauge | null>(null)
  const colors = useOrbColors()

  if (!fluid.enabled) return <OrbCss size={size} label={label} colors={colors} onPress={onPress} />

  const glow = Math.round(size * GLOW_RATIO)
  const canvas = (
    <FluidCanvas
      options={{ shape: 'orb', side: 1, margin: glow, thickness: 0, spin }}
      colors={colors}
      onFail={fluid.fail}
      onReady={(g) => (gauge.current = g)}
      style={{ inset: -glow }}
    />
  )

  if (!onPress) {
    return (
      <div role="img" aria-label={label} className="relative" style={{ width: size, height: size }}>
        {canvas}
      </div>
    )
  }

  const press = (down: boolean) => gauge.current?.setPressed(down)
  const open = () => {
    gauge.current?.startRipple()
    window.setTimeout(onPress, OPEN_DELAY)
  }

  return (
    <button
      type="button"
      aria-label={label}
      onClick={open}
      onPointerDown={() => press(true)}
      onPointerUp={() => press(false)}
      onPointerLeave={() => press(false)}
      onPointerCancel={() => press(false)}
      className="relative rounded-full"
      style={{ width: size, height: size }}
    >
      {canvas}
    </button>
  )
}
