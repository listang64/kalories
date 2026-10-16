import { MACROS, type MacroMeta } from '../../config/macros'
import type { Profile } from '../../config/users'
import type { PersonDay } from '../../hooks/useHomeData'
import { formatInt } from '../../lib/format'
import { AnimatedNumber } from '../AnimatedNumber'
import { BarGauge } from '../fluid/BarGauge'

interface Props {
  profile: Profile
  day: PersonDay
  onToggle: () => void
}

export function MacroBlock({ profile, day, onToggle }: Props) {
  return (
    <button type="button" onClick={onToggle} className="block w-full text-left">
      <span className="flex items-center gap-2 text-[13px] text-text-2">
        <span
          className="size-2 rounded-full"
          style={{ background: profile.colorB, boxShadow: `0 0 8px ${profile.colorA}` }}
        />
        {profile.name}
      </span>
      <span className="mt-2.5 flex flex-col gap-3">
        {MACROS.map((meta) => (
          <MacroRow
            key={meta.key}
            meta={meta}
            name={profile.name}
            value={day.totals[meta.key]}
            goal={day.goals[meta.key]}
          />
        ))}
      </span>
    </button>
  )
}

interface RowProps {
  meta: MacroMeta
  name: string
  value: number
  goal: number
}

function MacroRow({ meta, name, value, goal }: RowProps) {
  return (
    <span className="block">
      <span className="mb-1.5 flex items-baseline justify-between">
        <span className="label">{meta.label}</span>
        <span className="text-[13px] tabular-nums">
          <span className={value > goal ? 'text-accent' : 'text-text'}>
            <AnimatedNumber value={value} />
          </span>
          <span className="text-text-2"> / {formatInt(goal)} g</span>
        </span>
      </span>
      <BarGauge
        value={value}
        goal={goal}
        colorA={meta.colorA}
        colorB={meta.colorB}
        label={`${meta.label} de ${name} : ${formatInt(value)} sur ${formatInt(goal)} g`}
      />
    </span>
  )
}
