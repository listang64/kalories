import { additiveFromTag, type Additive, type Risk } from '../config/additives'
import type { Grade, Product } from './openFoodFacts'

export type Level = 0 | 1 | 2 | 3

export const LEVEL_COLORS = ['#1FA463', '#8BC34A', '#F5A524', '#E5484D']

const BAD = { min: 0, label: 'Mauvais', color: '#E5484D' }

export const RATINGS = [
  { min: 75, label: 'Excellent', color: '#1FA463' },
  { min: 50, label: 'Bon', color: '#8BC34A' },
  { min: 25, label: 'Médiocre', color: '#F5A524' },
  BAD,
]

export interface QualityScore {
  total: number | null
  nutrition: number | null
  additives: number
  organic: number
  capped: boolean
}

export interface Fact {
  key: string
  label: string
  detail: string
  value: string
  level: Level
  additives?: Additive[]
}

const GRADE_BANDS: Record<Grade, [number, number]> = { a: [48, 60], b: [36, 48], c: [22, 36], d: [10, 22], e: [0, 10] }
const FOOD_POINTS: Record<Grade, [number, number]> = { a: [-17, 0], b: [1, 2], c: [3, 10], d: [11, 18], e: [19, 40] }
const DRINK_POINTS: Record<Grade, [number, number]> = { a: [0, 0], b: [-8, 2], c: [3, 6], d: [7, 9], e: [10, 30] }
const PENALTY: Record<Risk, number> = { 0: 0, 1: 3, 2: 10, 3: 30 }

export function productAdditives(product: Product): Additive[] {
  return product.additives.map(additiveFromTag)
}

function nutritionPoints(product: Product): number | null {
  const grade = product.nutriscore
  if (!grade) return null
  const [low, high] = GRADE_BANDS[grade]
  const [best, worst] = (product.beverage ? DRINK_POINTS : FOOD_POINTS)[grade]
  const points = product.nutriscorePoints
  const position = points === null || best === worst ? 0.5 : Math.min(1, Math.max(0, (worst - points) / (worst - best)))
  return Math.round(low + (high - low) * position)
}

export function qualityScore(product: Product): QualityScore {
  const additives = productAdditives(product)
  const penalty = additives.reduce((sum, additive) => sum + (additive.risk === null ? 0 : PENALTY[additive.risk]), 0)
  const nutrition = nutritionPoints(product)
  const severe = additives.some((additive) => additive.risk === 3)
  const additivePoints = Math.max(0, 30 - penalty)
  const organic = product.organic ? 10 : 0
  const total = nutrition === null ? null : nutrition + additivePoints + organic
  const capped = severe && total !== null && total > 49
  return {
    total: total !== null && capped ? 49 : total,
    nutrition,
    additives: additivePoints,
    organic,
    capped,
  }
}

export function ratingOf(total: number) {
  return RATINGS.find((rating) => total >= rating.min) ?? BAD
}

interface Rule {
  key: string
  label: string
  unit: string
  food: [number, number, number]
  drink: [number, number, number]
  texts: [string, string, string, string]
  read: (product: Product) => number | null
}

const LIMITS: Rule[] = [
  {
    key: 'kcal',
    label: 'Calories',
    unit: 'kcal',
    food: [160, 360, 560],
    drink: [1, 14, 35],
    texts: ['Peu calorique', 'Un peu calorique', 'Calorique', 'Très calorique'],
    read: (product) => product.kcal100,
  },
  {
    key: 'saturated',
    label: 'Graisses saturées',
    unit: 'g',
    food: [1.5, 3, 5],
    drink: [0.75, 1.5, 2.5],
    texts: ['Peu de graisses saturées', 'Un peu de graisses saturées', 'Assez gras', 'Trop gras'],
    read: (product) => product.saturated100,
  },
  {
    key: 'sugars',
    label: 'Sucres',
    unit: 'g',
    food: [5, 12.5, 22.5],
    drink: [1, 4, 8],
    texts: ['Peu de sucre', 'Un peu sucré', 'Sucré', 'Trop sucré'],
    read: (product) => product.sugars100,
  },
  {
    key: 'salt',
    label: 'Sel',
    unit: 'g',
    food: [0.3, 0.75, 1.5],
    drink: [0.3, 0.5, 0.75],
    texts: ['Peu de sel', 'Un peu salé', 'Salé', 'Trop salé'],
    read: (product) => product.salt100,
  },
]

interface Bonus {
  key: string
  label: string
  unit: string
  steps: [number, number]
  texts: [string, string]
  read: (product: Product) => number | null
}

const BONUSES: Bonus[] = [
  {
    key: 'protein',
    label: 'Protéines',
    unit: 'g',
    steps: [8, 4.8],
    texts: ['Excellente source de protéines', 'Quelques protéines'],
    read: (product) => product.protein100,
  },
  {
    key: 'fiber',
    label: 'Fibres',
    unit: 'g',
    steps: [6, 3],
    texts: ['Riche en fibres', 'Source de fibres'],
    read: (product) => product.fiber100,
  },
  {
    key: 'fruits',
    label: 'Fruits et légumes',
    unit: '%',
    steps: [80, 40],
    texts: ['Beaucoup de fruits ou légumes', 'Des fruits ou légumes'],
    read: (product) => product.fruitVeg100,
  },
]

function format(value: number, unit: string): string {
  const shown = unit === 'g' && value < 10 ? Math.round(value * 10) / 10 : Math.round(value)
  return `${String(shown).replace('.', ',')} ${unit}`
}

function additivesFact(product: Product): Fact {
  const additives = productAdditives(product)
  const worst = Math.max(0, ...additives.map((additive) => additive.risk ?? 0)) as Level
  const risky = additives.filter((additive) => (additive.risk ?? 0) >= 2).length
  if (additives.length === 0) return { key: 'additives', label: 'Additifs', detail: 'Sans additif', value: '', level: 0 }
  return {
    key: 'additives',
    label: 'Additifs',
    detail:
      risky > 0
        ? `${risky} additif${risky > 1 ? 's' : ''} à risque`
        : `${additives.length} additif${additives.length > 1 ? 's' : ''} sans risque connu`,
    value: String(additives.length),
    level: worst >= 2 ? worst : 1,
    additives,
  }
}

export function productFacts(product: Product): { flaws: Fact[]; strengths: Fact[] } {
  const facts: Fact[] = [additivesFact(product)]
  for (const rule of LIMITS) {
    const value = rule.read(product)
    if (value === null) continue
    const [a, b, c] = product.beverage ? rule.drink : rule.food
    const level: Level = value <= a ? 0 : value <= b ? 1 : value <= c ? 2 : 3
    facts.push({ key: rule.key, label: rule.label, detail: rule.texts[level], value: format(value, rule.unit), level })
  }
  for (const bonus of BONUSES) {
    const value = bonus.read(product)
    if (value === null || value < bonus.steps[1]) continue
    const level: Level = value >= bonus.steps[0] ? 0 : 1
    facts.push({ key: bonus.key, label: bonus.label, detail: bonus.texts[level], value: format(value, bonus.unit), level })
  }
  if (product.nova === 4) {
    facts.push({ key: 'nova', label: 'Transformation', detail: 'Ultra-transformé (NOVA 4)', value: '', level: 2 })
  }
  if (product.nova === 1) {
    facts.push({ key: 'nova', label: 'Transformation', detail: 'Brut ou peu transformé', value: '', level: 0 })
  }
  if (product.organic) {
    facts.push({ key: 'organic', label: 'Bio', detail: 'Issu de l’agriculture biologique', value: '', level: 0 })
  }
  return {
    flaws: facts.filter((fact) => fact.level >= 2).sort((a, b) => b.level - a.level),
    strengths: facts.filter((fact) => fact.level <= 1).sort((a, b) => a.level - b.level),
  }
}
