import type { Profile } from '../../config/users'
import { formatInt } from '../../lib/format'
import type { PersonStats } from '../../lib/history'
import { AnimatedNumber } from '../AnimatedNumber'

interface Entry {
  profile: Profile
  stats: PersonStats
  goal: number
}

export function StatsCards({ entries }: { entries: Entry[] }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {entries.map(({ profile, stats, goal }) => (
        <StatCard key={profile.id} profile={profile} stats={stats} goal={goal} />
      ))}
    </div>
  )
}

function StatCard({ profile, stats, goal }: Entry) {
  const share = stats.logged ? stats.under / stats.logged : 0

  return (
    <section className="rounded-card border border-line bg-surface-2 p-4">
      <h3 className="flex items-center gap-2 text-[14px] font-semibold">
        <span className="size-2 rounded-full" style={{ background: profile.chartColor }} />
        {profile.name}
      </h3>
      <p className="mt-3 text-[26px] leading-none font-semibold">
        {stats.average === null ? '—' : <AnimatedNumber value={stats.average} />}
      </p>
      <p className="mt-1 text-[12px] text-text-2">kcal par jour en moyenne</p>
      <p className="mt-2 flex items-center gap-1.5 text-[12px] text-text-2 tabular-nums">
        <svg width="14" height="2" aria-hidden="true">
          <line x1="0" x2="14" y1="1" y2="1" stroke={profile.chartColor} strokeDasharray="3 3" />
        </svg>
        Plafond <span className="text-text">{formatInt(goal)}</span>
      </p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full rounded-full transition-[width] duration-700"
          style={{ width: `${share * 100}%`, background: profile.chartColor }}
        />
      </div>
      <p className="mt-1.5 text-[12px] text-text-2 tabular-nums">
        <span className="text-text">{formatInt(stats.under)}</span> / {formatInt(stats.logged)} jours sous le plafond
      </p>
      <p className="mt-2 text-[12px] text-text-2">
        Série en cours : <span className="text-text">{stats.streak} j</span>
      </p>
    </section>
  )
}
