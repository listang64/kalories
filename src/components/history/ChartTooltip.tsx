import { formatInt } from '../../lib/format'
import { formatDayName, valueOf, type DayPoint } from '../../lib/history'
import type { ChartSeries } from './HistoryChart'

interface Props {
  point: DayPoint
  series: ChartSeries[]
  left: number
}

export const TOOLTIP_WIDTH = 176

export function ChartTooltip({ point, series, left }: Props) {
  return (
    <div
      className="pointer-events-none absolute -top-2 z-10 rounded-xl border border-line bg-surface-2/95 px-3 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.5)] backdrop-blur-md"
      style={{ left, width: TOOLTIP_WIDTH }}
    >
      <p className="text-[12px] text-text-2">{formatDayName(point.date)}</p>
      {series.map((s) => {
        const value = valueOf(point, s.id)
        const over = value !== null && value > s.goal ? value - s.goal : 0
        return (
          <div key={s.id} className="mt-1 flex items-center gap-2 tabular-nums">
            <span className="h-0.5 w-3 shrink-0 rounded-full" style={{ background: s.color }} />
            <span className="text-[15px] font-semibold">{value === null ? '—' : formatInt(value)}</span>
            <span className="text-[12px] text-text-2">{s.name}</span>
            {over > 0 && <span className="ml-auto text-[12px] text-accent">▲ {formatInt(over)}</span>}
          </div>
        )
      })}
    </div>
  )
}
