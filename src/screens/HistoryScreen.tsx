import { useState } from 'react'
import { DayList } from '../components/history/DayList'
import { HistoryChart, type ChartSeries } from '../components/history/HistoryChart'
import { HistoryLegend } from '../components/history/HistoryLegend'
import { StatsCards } from '../components/history/StatsCards'
import { useMeals } from '../hooks/useMeals'
import { useToday } from '../hooks/useToday'
import { buildHistory, HISTORY_DAYS, lastDays, statsFor } from '../lib/history'
import { goalsOf, type Profile } from '../lib/profiles'

export function HistoryScreen({ people }: { people: Profile[] }) {
  const today = useToday()
  const days = lastDays(today, HISTORY_DAYS)
  const meals = useMeals(people.map((person) => person.uid), days[0] ?? today, today)
  const [hidden, setHidden] = useState<string[]>([])
  const points = buildHistory(meals, days)
  const series: ChartSeries[] = people.map((person) => ({
    id: person.uid,
    name: person.name,
    color: person.chartColor,
    goal: goalsOf(person).kcal,
  }))
  const shown = series.filter((s) => !hidden.includes(s.id))
  const toggle = (id: string) =>
    setHidden((current) => (current.includes(id) ? current.filter((h) => h !== id) : [...current, id]))

  return (
    <div className="flex flex-col gap-6 pt-1 pb-2">
      <div>
        <p className="label mb-3 px-1">30 derniers jours</p>
        <HistoryLegend series={series} hidden={hidden} onToggle={toggle} />
      </div>
      <HistoryChart points={points} series={shown} />
      <StatsCards
        entries={people.map((profile) => {
          const goal = goalsOf(profile).kcal
          return { profile, goal, stats: statsFor(points, profile.uid, goal, today) }
        })}
      />
      <DayList points={points} series={series} />
    </div>
  )
}
