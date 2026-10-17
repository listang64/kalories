import { useElementSize } from '../../hooks/useElementSize'
import { useMeals } from '../../hooks/useMeals'
import { useToday } from '../../hooks/useToday'
import { buildHistory, HISTORY_DAYS, lastDays } from '../../lib/history'
import { goalsOf, type Profile } from '../../lib/profiles'
import { HistoryChart } from './HistoryChart'
import { CeilingKey } from './HistoryLegend'

const MIN_HEIGHT = 120

export function PersonalChart({ me }: { me: Profile }) {
  const today = useToday()
  const days = lastDays(today, HISTORY_DAYS)
  const meals = useMeals([me.uid], days[0] ?? today, today)
  const [ref, { height }] = useElementSize<HTMLDivElement>()
  const series = [{ id: me.uid, name: me.name, color: me.chartColor, goal: goalsOf(me).kcal }]

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center px-1">
        <p className="label">Tes 30 derniers jours</p>
        <CeilingKey />
      </div>
      <div ref={ref} className="mt-2 min-h-0 flex-1">
        {height >= MIN_HEIGHT && (
          <HistoryChart points={buildHistory(meals, days)} series={series} height={Math.floor(height)} />
        )}
      </div>
    </div>
  )
}
