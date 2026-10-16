import { useRef } from 'react'
import { PROFILES } from '../../config/users'
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
const COLORS = [PROFILES.nico.colorA, PROFILES.nico.colorB, PROFILES.chachou.colorA, PROFILES.chachou.colorB]

export function FluidOrb({ size, label, onPress, spin = 1 }: Props) {
  const fluid = useFluidSupport()
  const gauge = useRef<FluidGauge | null>(null)

  if (!fluid.enabled) return <OrbCss size={size} label={label} onPress={onPress} />

  const glow = Math.round(size * GLOW_RATIO)
  const canvas = (
    <FluidCanvas
      options={{ shape: 'orb', side: 1, margin: glow, thickness: 0, spin }}
      colors={COLORS}
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
