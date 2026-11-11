import type { HoursData } from '../../hooks/useHours'
import { balanceAt, balanceWord, monthMinutes } from '../../lib/hours/model'
import { formatDuration } from '../../lib/hours/time'
import { GREEN, RED } from './ui'

interface Props {
  data: HoursData
  month: string
  today: string
  onSettings: () => void
}

function Stat({ label, value, tone, small }: { label: string; value: string; tone?: string; small?: string }) {
  return (
    <div className="min-w-0 rounded-xl bg-black/30 px-3 py-2.5">
      <p className="text-[12px] leading-tight text-text-2">{label}</p>
      <p className="mt-0.5 truncate text-[22px] leading-tight font-semibold tabular-nums" style={tone ? { color: tone } : undefined}>
        {value}
      </p>
      {small && <p className="truncate text-[12px] text-text-2">{small}</p>}
    </div>
  )
}

export function MonthSummary({ data, month, today, onSettings }: Props) {
  const days = data.months[month] ?? {}
  const done = monthMinutes(days)
  const target = data.settings.targets[month]
  const balance = balanceAt(data.settings, data.months, today)

  return (
    <section className="rounded-card border border-line bg-surface-2 p-3">
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Heures effectuées" value={formatDuration(done)} />
        {target === undefined ? (
          <button type="button" onClick={onSettings} className="press min-w-0 rounded-xl border border-dashed border-white/20 px-3 py-2.5 text-left">
            <p className="text-[12px] leading-tight text-text-2">Objectif du mois</p>
            <p className="mt-1 text-[16px] font-semibold text-accent">À définir</p>
          </button>
        ) : (
          <Stat label="Objectif du mois" value={formatDuration(target * 60)} />
        )}
        <div className="col-span-2">
          <Stat
            label="Compteur global"
            value={formatDuration(balance, true)}
            tone={balance < 0 ? RED : balance > 0 ? GREEN : undefined}
            small={balanceWord(balance)}
          />
        </div>
      </div>
      <p className="mt-2 px-1 text-[12px] leading-snug text-text-2">Chaque journée saisie ajoute ou retire son écart avec ton horaire type.</p>
    </section>
  )
}
