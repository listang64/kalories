import { useState } from 'react'
import { DayList } from '../components/history/DayList'
import { HistoryChart, type ChartSeries } from '../components/history/HistoryChart'
import { HistoryLegend } from '../components/history/HistoryLegend'
import { StatsCards } from '../components/history/StatsCards'
import { PROFILE_LIST, type ProfileId } from '../config/users'
import { useMealsRange } from '../hooks/useMealsRange'
import { goalsOf, useProfiles } from '../hooks/useProfiles'
import { useToday } from '../hooks/useToday'
import { buildHistory, lastDays, statsFor } from '../lib/history'

const DAYS = 30

export function HistoryScreen() {
  const today = useToday()
  const days = lastDays(today, DAYS)
  const meals = useMealsRange(days[0] ?? today, today)
  const settings = useProfiles()
  const [hidden, setHidden] = useState<ProfileId[]>([])
  const points = buildHistory(meals, days)
  const series: ChartSeries[] = PROFILE_LIST.map((profile) => ({
    id: profile.id,
    name: profile.name,
    color: profile.chartColor,
    goal: goalsOf(settings[profile.id]).kcal,
  }))
  const shown = series.filter((s) => !hidden.includes(s.id))
  const toggle = (id: ProfileId) =>
    setHidden((current) => (current.includes(id) ? current.filter((h) => h !== id) : [...current, id]))

  return (
    <div className="flex flex-col gap-6 pt-1 pb-2">
      <div>
        <p className="label mb-3 px-1">30 derniers jours</p>
        <HistoryLegend hidden={hidden} onToggle={toggle} />
      </div>
      <HistoryChart points={points} series={shown} />
      <StatsCards
        entries={PROFILE_LIST.map((profile) => {
          const goal = goalsOf(settings[profile.id]).kcal
          return { profile, goal, stats: statsFor(points, profile.id, goal, today) }
        })}
      />
      <DayList points={points} series={series} />
    </div>
  )
}
