import type { Totals } from '../lib/nutrition'
import { MACROS } from './macros'

export type Metric = keyof Totals

export interface MetricMeta {
  key: Metric
  label: string
  unit: string
  suffix: string
  goal: string
  hits: string
  floor: number
  reach: boolean
}

export const KCAL_METRIC: MetricMeta = {
  key: 'kcal',
  label: 'Calories',
  unit: 'kcal',
  suffix: '',
  goal: 'Plafond',
  hits: 'sous le plafond',
  floor: 1500,
  reach: false,
}

export const METRICS: MetricMeta[] = [
  KCAL_METRIC,
  ...MACROS.map(({ key, label }) => ({
    key,
    label,
    unit: 'g',
    suffix: ' g',
    goal: 'Objectif',
    hits: key === 'protein' ? 'objectif atteint' : 'sous l’objectif',
    floor: 0,
    reach: key === 'protein',
  })),
]
