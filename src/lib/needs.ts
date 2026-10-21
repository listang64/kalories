export type Sex = 'female' | 'male'
export type Lifestyle = 'sitting' | 'mixed' | 'standing' | 'physical'
export type Intensity = 'easy' | 'normal' | 'hard'
export type Direction = 'lose' | 'keep' | 'gain'

export interface Body {
  sex: Sex
  age: number
  height: number
  weight: number
  bodyFat: number | null
}

export interface SportSession {
  key: string
  sport: string
  sessions: number
  minutes: number
  intensity: Intensity
}

export interface NeedsInput {
  body: Body
  lifestyle: Lifestyle
  steps: number
  sports: SportSession[]
}

export interface Energy {
  bmr: number
  formula: string
  daily: number
  walking: number
  sport: number
  digestion: number
  total: number
}

export interface Pace {
  id: string
  label: string
  detail: string
  change: number
}

export interface Plan {
  kcal: number
  change: number
  weekly: number
  carbs: number
  fat: number
  protein: number
  warning: string | null
}

export const LIFESTYLES: { value: Lifestyle; label: string; detail: string; factor: number }[] = [
  { value: 'sitting', label: 'Assis presque toute la journée', detail: 'Bureau, télétravail, études, conduite', factor: 1.15 },
  { value: 'mixed', label: 'Entre assis et debout', detail: 'Enseignement, laboratoire, parent au foyer', factor: 1.25 },
  { value: 'standing', label: 'Debout la plupart du temps', detail: 'Vente, coiffure, restauration, soins', factor: 1.35 },
  { value: 'physical', label: 'Travail physique', detail: 'Bâtiment, manutention, agriculture, ménage', factor: 1.5 },
]

const OTHER_SPORT = { id: 'autre', label: 'Autre sport', met: 6 }

export const SPORTS: { id: string; label: string; met: number }[] = [
  { id: 'muscu', label: 'Musculation', met: 5 },
  { id: 'course', label: 'Course à pied', met: 9 },
  { id: 'velo', label: 'Vélo', met: 7 },
  { id: 'natation', label: 'Natation', met: 6.5 },
  { id: 'marche', label: 'Marche rapide', met: 4.3 },
  { id: 'rando', label: 'Randonnée', met: 6 },
  { id: 'hiit', label: 'HIIT, CrossFit', met: 8 },
  { id: 'cardio', label: 'Elliptique, rameur', met: 6 },
  { id: 'collectif', label: 'Foot, basket, hand', met: 7 },
  { id: 'raquette', label: 'Tennis, badminton, padel', met: 6.5 },
  { id: 'combat', label: 'Boxe, arts martiaux', met: 8 },
  { id: 'danse', label: 'Danse, zumba', met: 5.5 },
  { id: 'yoga', label: 'Yoga, Pilates', met: 3 },
  OTHER_SPORT,
]

export const INTENSITIES: { value: Intensity; label: string; factor: number }[] = [
  { value: 'easy', label: 'Tranquille', factor: 0.75 },
  { value: 'normal', label: 'Normale', factor: 1 },
  { value: 'hard', label: 'Intense', factor: 1.3 },
]

const KEEP: Pace = { id: 'keep', label: 'Maintien', detail: 'Garder ton poids actuel', change: 0 }

export const PACES: Record<Direction, Pace[]> = {
  lose: [
    { id: 'lose-soft', label: 'Douce', detail: 'Facile à tenir, idéale pour démarrer', change: -0.1 },
    { id: 'lose-moderate', label: 'Modérée', detail: 'Le meilleur compromis, conseillée', change: -0.15 },
    { id: 'lose-firm', label: 'Soutenue', detail: 'Plus rapide, demande de la rigueur', change: -0.2 },
    { id: 'lose-hard', label: 'Intense', detail: 'Quelques semaines seulement', change: -0.25 },
  ],
  keep: [KEEP],
  gain: [
    { id: 'gain-lean', label: 'Légère', detail: 'Du muscle avec le moins de gras possible', change: 0.05 },
    { id: 'gain-moderate', label: 'Modérée', detail: 'Progression plus rapide', change: 0.1 },
    { id: 'gain-fast', label: 'Rapide', detail: 'Pour ceux qui ont du mal à grossir', change: 0.15 },
  ],
}

export const DEFAULT_PACE: Record<Direction, string> = { lose: 'lose-moderate', keep: 'keep', gain: 'gain-lean' }

export const KCAL_PER_KG = 7700
export const FIBER_GRAMS = 30
const TEF = 0.1
const STRIDE = 0.414
const WALK_KCAL_PER_KG_KM = 0.5
const FAT_SHARE = 0.3
const PROTEIN_PER_KG: Record<Direction, number> = { lose: 2, keep: 1.6, gain: 1.8 }

export const sportById = (id: string) => SPORTS.find((sport) => sport.id === id) ?? OTHER_SPORT
const roundTo = (value: number, step: number) => Math.round(value / step) * step

export function paceFor(direction: Direction, id: string): Pace {
  const paces = PACES[direction]
  return paces.find((pace) => pace.id === id) ?? paces.find((pace) => pace.id === DEFAULT_PACE[direction]) ?? KEEP
}

export function basalRate({ sex, age, height, weight, bodyFat }: Body) {
  if (bodyFat !== null) return { bmr: 370 + 21.6 * weight * (1 - bodyFat / 100), formula: 'Katch-McArdle' }
  return { bmr: 10 * weight + 6.25 * height - 5 * age + (sex === 'male' ? 5 : -161), formula: 'Mifflin-St Jeor' }
}

export function sessionKcal(session: SportSession, weight: number, bmr: number): number {
  const factor = INTENSITIES.find((level) => level.value === session.intensity)?.factor ?? 1
  const met = sportById(session.sport).met * factor
  return Math.max(0, met * weight - bmr / 24) * (session.minutes / 60)
}

export function energyOf({ body, lifestyle, steps, sports }: NeedsInput): Energy {
  const { bmr, formula } = basalRate(body)
  const factor = LIFESTYLES.find((option) => option.value === lifestyle)?.factor ?? 1.15
  const daily = bmr * (factor - 1)
  const walking = ((steps * (body.height / 100) * STRIDE) / 1000) * WALK_KCAL_PER_KG_KM * body.weight
  const sport = sports.reduce((sum, session) => sum + sessionKcal(session, body.weight, bmr) * session.sessions, 0) / 7
  const spent = bmr + daily + walking + sport
  const total = spent / (1 - TEF)
  return { bmr, formula, daily, walking, sport, digestion: total - spent, total }
}

export function referenceWeight({ height, weight }: Body): number {
  const healthy = 25 * (height / 100) ** 2
  return weight > healthy ? healthy + 0.25 * (weight - healthy) : weight
}

export function planFor(energy: Energy, body: Body, direction: Direction, pace: Pace): Plan {
  const kcal = roundTo(energy.total * (1 + pace.change), 10)
  const change = kcal - roundTo(energy.total, 10)
  const weekly = (change * 7) / KCAL_PER_KG
  const protein = Math.round(PROTEIN_PER_KG[direction] * referenceWeight(body))
  const fat = Math.round((kcal * FAT_SHARE) / 9)
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4))
  const floor = Math.max(energy.bmr, body.sex === 'male' ? 1500 : 1200)
  const warning =
    kcal < floor
      ? 'Sous ton métabolisme de base : fatigue et perte de muscle probables. Préfère une intensité plus douce.'
      : -weekly > body.weight * 0.01
        ? 'Plus de 1 % de ton poids par semaine : difficile à tenir sans perdre de muscle.'
        : null
  return { kcal, change, weekly, carbs, fat, protein, warning }
}

export function waterLitres(sex: Sex): number {
  return sex === 'male' ? 2 : 1.6
}
