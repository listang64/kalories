import { formatInt } from '../../lib/format'
import { AnimatedNumber } from '../AnimatedNumber'
import type { PersonEntry } from './CalorieRing'

export function CalorieLegend({ entries }: { entries: PersonEntry[] }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {entries.map((entry) => (
        <LegendItem key={entry.profile.id} {...entry} />
      ))}
    </div>
  )
}

function LegendItem({ profile, day }: PersonEntry) {
  const goal = day.goals.kcal
  const kcal = day.totals.kcal
  const rest = goal - kcal
  const over = rest < 0

  return (
    <div className="flex flex-col items-center text-center tabular-nums">
      <span className="text-[13px] font-semibold" style={{ color: profile.colorB }}>
        {profile.name}
      </span>
      <p className="mt-0.5 whitespace-nowrap">
        <span className={`text-[22px] font-semibold ${over ? 'text-accent' : ''}`}>
          <AnimatedNumber value={kcal} />
        </span>
        <span className="text-[13px] text-text-2"> / {formatInt(goal)} kcal</span>
      </p>
      <span className={`text-[13px] ${over ? 'text-accent' : 'text-text-2'}`}>
        {over ? '+' : 'reste '}
        <AnimatedNumber value={Math.abs(rest)} />
        {over && ' kcal'}
      </span>
    </div>
  )
}
