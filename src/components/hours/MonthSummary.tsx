import type { HoursData } from '../../hooks/useHours'
import { balanceAt, balanceWord, entryMinutes, lastDayOf, monthMinutes } from '../../lib/hours/model'
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
  const ended = lastDayOf(month) < today
  const gap = target === undefined ? null : done - target * 60
  const balance = balanceAt(data.settings, data.months, today)
  const entries = Object.values(days)
  const meals = entries.filter((entry) => entry.meal && !entry.off).length
  const worked = entries.filter((entry) => entryMinutes(entry) > 0).length

  return (
    <section className="rounded-card border border-line bg-surface-2 p-3">
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Heures effectuées" value={formatDuration(done)} small={`${worked} jour${worked > 1 ? 's' : ''} · ${meals} repas`} />
        {target === undefined ? (
          <button type="button" onClick={onSettings} className="press min-w-0 rounded-xl border border-dashed border-white/20 px-3 py-2.5 text-left">
            <p className="text-[12px] leading-tight text-text-2">Objectif du mois</p>
            <p className="mt-1 text-[16px] font-semibold text-accent">À définir</p>
          </button>
        ) : (
          <Stat label="Objectif du mois" value={formatDuration(target * 60)} />
        )}
        {gap !== null &&
          (ended ? (
            <Stat label="Écart du mois" value={formatDuration(gap, true)} tone={gap < 0 ? RED : gap > 0 ? GREEN : undefined} small={balanceWord(gap)} />
          ) : gap < 0 ? (
            <Stat label="Reste à faire" value={formatDuration(-gap)} />
          ) : (
            <Stat label="En plus ce mois" value={formatDuration(gap, true)} tone={gap > 0 ? GREEN : undefined} />
          ))}
        <Stat
          label="Compteur global"
          value={formatDuration(balance, true)}
          tone={balance < 0 ? RED : balance > 0 ? GREEN : undefined}
          small={balanceWord(balance)}
        />
      </div>
      <p className="mt-2 px-1 text-[12px] leading-snug text-text-2">Le compteur intègre chaque mois une fois terminé.</p>
    </section>
  )
}
