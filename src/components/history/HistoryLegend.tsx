import type { ChartSeries } from './HistoryChart'

interface Props {
  series: ChartSeries[]
  hidden: string[]
  onToggle: (id: string) => void
}

export function HistoryLegend({ series, hidden, onToggle }: Props) {
  return (
    <div className="flex gap-2">
      {series.length > 1 &&
        series.map((s) => {
          const off = hidden.includes(s.id)
          return (
            <button
              key={s.id}
              type="button"
              aria-pressed={!off}
              onClick={() => onToggle(s.id)}
              className={`press flex h-9 items-center gap-2 rounded-full border border-line bg-surface-2 px-3.5 text-[14px] transition-opacity ${off ? 'opacity-40' : ''}`}
            >
              <span className="h-0.5 w-4 rounded-full" style={{ background: s.color }} />
              {s.name}
            </button>
          )
        })}
      <CeilingKey />
    </div>
  )
}

export function CeilingKey() {
  return (
    <span className="ml-auto flex items-center gap-2 text-[12px] text-text-2">
      <svg width="16" height="2" aria-hidden="true">
        <line x1="0" x2="16" y1="1" y2="1" stroke="currentColor" strokeDasharray="3 3" />
      </svg>
      Plafond
    </span>
  )
}
