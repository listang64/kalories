import { formatInt } from '../../lib/format'
import { formatDayName, valueOf, type DayPoint } from '../../lib/history'
import type { ChartSeries } from './HistoryChart'

interface Props {
  points: DayPoint[]
  series: ChartSeries[]
}

export function DayList({ points, series }: Props) {
  const days = [...points].reverse().filter((point) => series.some((s) => valueOf(point, s.id) !== null))
  if (days.length === 0) return <p className="py-6 text-center text-[15px] text-text-2">Aucun repas sur ces 30 jours.</p>

  return (
    <section>
      <div className="flex items-center px-1 pb-2">
        <h3 className="label flex-1">Jour par jour</h3>
        {series.map((s) => (
          <span key={s.id} className="flex w-20 items-center justify-end gap-1.5 text-[12px] text-text-2">
            <span className="h-0.5 w-3 rounded-full" style={{ background: s.color }} />
            {s.name}
          </span>
        ))}
      </div>
      <ul className="divide-y divide-line overflow-hidden rounded-card border border-line bg-surface-2">
        {days.map((day) => (
          <li key={day.date} className="flex items-center px-4 py-2.5 text-[15px] tabular-nums">
            <span className="flex-1 text-text-2">{formatDayName(day.date)}</span>
            {series.map((s) => {
              const value = valueOf(day, s.id)
              const over = value !== null && value > s.goal
              return (
                <span key={s.id} className={`w-20 text-right ${over ? 'text-accent' : ''}`}>
                  {value === null ? '—' : `${over ? '▲ ' : ''}${formatInt(value)}`}
                </span>
              )
            })}
          </li>
        ))}
      </ul>
    </section>
  )
}
