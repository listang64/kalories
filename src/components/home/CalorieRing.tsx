import { useElementSize } from '../../hooks/useElementSize'
import type { PersonEntry } from '../../hooks/useHomeData'
import { formatInt } from '../../lib/format'
import { ArcGauge } from '../fluid/ArcGauge'
import { FluidOrb } from '../fluid/FluidOrb'

interface Props {
  left: PersonEntry
  right: PersonEntry | null
  onOrb: () => void
}

const ORB_MAX = 120

export function CalorieRing({ left, right, onOrb }: Props) {
  const [ref, { width, height }] = useElementSize<HTMLDivElement>()
  const size = Math.floor(Math.min(width, height))
  const orb = Math.min(ORB_MAX, Math.round(size * 0.46))

  return (
    <div ref={ref} className="relative min-h-0 flex-1">
      {size > 0 && (
        <div
          className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2"
          style={{ width: size, height: size }}
        >
          {[left, right ?? left].map(({ profile, day }, i) => (
            <div key={`${profile.uid}-${i}`} aria-hidden={i === 1 && !right ? true : undefined}>
              <ArcGauge
                side={i === 0 ? 'left' : 'right'}
                value={day.totals.kcal}
                goal={day.goals.kcal}
                colorA={profile.colorA}
                colorB={profile.colorB}
                size={size}
                label={`${profile.name} : ${formatInt(day.totals.kcal)} sur ${formatInt(day.goals.kcal)} kcal`}
              />
            </div>
          ))}
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="pointer-events-auto">
              <FluidOrb size={orb} label="Détail de la journée" onPress={onOrb} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
