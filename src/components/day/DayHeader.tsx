import { PROFILE_LIST, type ProfileId } from '../../config/users'
import { addDays, dayLabel } from '../../lib/dates'
import type { Totals } from '../../lib/nutrition'
import { AnimatedNumber } from '../AnimatedNumber'
import { ChevronIcon } from '../icons/ChevronIcon'
import { Segmented } from '../Segmented'

interface Props {
  viewed: ProfileId
  onViewed: (id: ProfileId) => void
  date: string
  today: string
  onDate: (date: string) => void
  totals: Totals
  goal: number
}

const PEOPLE = PROFILE_LIST.map((profile) => ({ value: profile.id, label: profile.name }))

export function DayHeader({ viewed, onViewed, date, today, onDate, totals, goal }: Props) {
  const rest = goal - totals.kcal

  return (
    <div className="shrink-0">
      <Segmented label="Profil affiché" value={viewed} options={PEOPLE} onChange={onViewed} />
      <div className="mt-4 flex items-center justify-between">
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
