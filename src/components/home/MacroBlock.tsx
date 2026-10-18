import { MACROS, type MacroMeta } from '../../config/macros'
import type { PersonEntry } from '../../hooks/useHomeData'
import { formatInt } from '../../lib/format'
import { AnimatedNumber } from '../AnimatedNumber'
import { BarGauge } from '../fluid/BarGauge'

interface Props {
  entry: PersonEntry
  onToggle?: () => void
}

export function MacroBlock({ entry: { profile, day }, onToggle }: Props) {
  const content = (
    <>
      <span className="flex items-center gap-2 text-[13px] text-text-2">
        <span
          className="size-2 rounded-full"
          style={{ background: profile.colorB, boxShadow: `0 0 8px ${profile.colorA}` }}
        />
        {profile.name}
        {onToggle && <span className="sr-only">, toucher pour voir l’autre profil</span>}
      </span>
      <span className="mt-2 flex flex-col gap-2.5">
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
    </>
  )

  return onToggle ? (
    <button type="button" onClick={onToggle} className="block w-full text-left">
      {content}
    </button>
  ) : (
    <div>{content}</div>
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
      <span className="mb-1 flex items-baseline justify-between">
        <span className="label font-bold text-accent">{meta.label}</span>
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
