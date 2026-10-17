import { addDays, dayLabel } from '../../lib/dates'
import type { Totals } from '../../lib/nutrition'
import type { Profile } from '../../lib/profiles'
import { AnimatedNumber } from '../AnimatedNumber'
import { ChevronIcon } from '../icons/ChevronIcon'
import { Segmented } from '../Segmented'

interface Props {
  people: Profile[]
  viewed: string
  onViewed: (uid: string) => void
  date: string
  today: string
  onDate: (date: string) => void
  totals: Totals
  goal: number
}

export function DayHeader({ people, viewed, onViewed, date, today, onDate, totals, goal }: Props) {
  const rest = goal - totals.kcal
  const options = people.map((person) => ({ value: person.uid, label: person.name }))

  return (
    <div className="shrink-0">
      {options.length > 1 && <Segmented label="Profil affiché" value={viewed} options={options} onChange={onViewed} />}
      <div className={`flex items-center justify-between ${options.length > 1 ? 'mt-4' : ''}`}>
        <button
          type="button"
          aria-label="Jour précédent"
          onClick={() => onDate(addDays(date, -1))}
          className="grid size-10 place-items-center rounded-full text-text-2 active:bg-white/8"
        >
          <ChevronIcon size={22} direction="left" />
        </button>
        <span className="text-[17px] font-semibold">{dayLabel(date, today)}</span>
        <button
          type="button"
          aria-label="Jour suivant"
          disabled={date >= today}
          onClick={() => onDate(addDays(date, 1))}
          className="grid size-10 place-items-center rounded-full text-text-2 active:bg-white/8 disabled:opacity-25"
        >
          <ChevronIcon size={22} />
        </button>
      </div>
      <div className="mt-3 text-center tabular-nums">
        <p className="text-[40px] leading-none font-semibold tracking-[-0.02em]">
          <AnimatedNumber value={totals.kcal} />
          <span className="ml-1.5 text-[17px] font-medium text-text-2">/ <AnimatedNumber value={goal} /> kcal</span>
        </p>
        <p className={`mt-2 text-[15px] ${rest < 0 ? 'text-accent' : 'text-text-2'}`}>
          {rest < 0 ? '+' : 'reste '}
          <AnimatedNumber value={Math.abs(rest)} />
          {rest < 0 ? ' kcal' : ''}
        </p>
        <p className="mt-0.5 text-[13px] text-text-2">
          G <AnimatedNumber value={totals.carbs} /> g · L <AnimatedNumber value={totals.fat} /> g · P{' '}
          <AnimatedNumber value={totals.protein} /> g
        </p>
      </div>
    </div>
  )
}
