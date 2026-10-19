import { useState } from 'react'
import { DayList } from '../components/history/DayList'
import { HistoryChart, type ChartSeries } from '../components/history/HistoryChart'
import { CeilingKey, HistoryLegend } from '../components/history/HistoryLegend'
import { StatsCards } from '../components/history/StatsCards'
import { Segmented } from '../components/Segmented'
import { KCAL_METRIC, METRICS, type Metric } from '../config/metrics'
import { useMeals } from '../hooks/useMeals'
import { useToday } from '../hooks/useToday'
import { buildHistory, HISTORY_DAYS, lastDays, statsFor } from '../lib/history'
import { goalsOf, type Profile } from '../lib/profiles'

const OPTIONS = METRICS.map(({ key, label }) => ({ value: key, label }))

interface Props {
  me: Profile
  people: Profile[]
}

export function HistoryScreen({ me, people }: Props) {
  const today = useToday()
  const days = lastDays(today, HISTORY_DAYS)
  const meals = useMeals(people.map((person) => person.uid), days[0] ?? today, today)
  const [hidden, setHidden] = useState<string[]>([])
  const [selected, setSelected] = useState<Metric>('kcal')
  const metric = METRICS.find((m) => m.key === selected) ?? KCAL_METRIC
  const shownPeople = selected === 'kcal' ? people : [me]
  const points = buildHistory(meals, days, selected)
  const series: ChartSeries[] = shownPeople.map((person) => ({
    id: person.uid,
    name: person.name,
    color: person.chartColor,
    goal: goalsOf(person)[selected],
  }))
  const shown = series.length > 1 ? series.filter((s) => !hidden.includes(s.id)) : series
  const toggle = (id: string) =>
    setHidden((current) => (current.includes(id) ? current.filter((h) => h !== id) : [...current, id]))

  return (
    <div className="flex flex-col gap-6 pt-1 pb-2">
      <Segmented label="Mesure affichée" value={selected} options={OPTIONS} onChange={setSelected} />
      <div>
        <div className="flex items-center px-1">
          <p className="label">
            {selected === 'kcal' ? '30 derniers jours' : `Tes ${metric.label.toLowerCase()} · 30 jours`}
          </p>
          {series.length === 1 && <CeilingKey label={metric.goal} />}
        </div>
        {series.length > 1 && <HistoryLegend series={series} hidden={hidden} onToggle={toggle} />}
      </div>
      <HistoryChart key={selected} points={points} series={shown} metric={metric} />
      <StatsCards
        metric={metric}
        entries={shownPeople.map((profile) => {
          const goal = goalsOf(profile)[selected]
          return { profile, goal, stats: statsFor(points, profile.uid, goal, today, metric) }
        })}
      />
      <DayList points={points} series={series} metric={metric} />
    </div>
  )
}
