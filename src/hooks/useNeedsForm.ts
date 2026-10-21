import { useEffect, useState } from 'react'
import {
  DEFAULT_PACE,
  INTENSITIES,
  LIFESTYLES,
  PACES,
  SPORTS,
  type Direction,
  type Lifestyle,
  type NeedsInput,
  type Sex,
  type SportSession,
} from '../lib/needs'
import { useAppStore } from '../store/appStore'

export interface NeedsForm {
  sex: Sex | null
  age: string
  height: string
  weight: string
  bodyFat: string
  lifestyle: Lifestyle
  steps: string
  sports: SportSession[]
  direction: Direction
  pace: string
}

const EMPTY: NeedsForm = {
  sex: null,
  age: '',
  height: '',
  weight: '',
  bodyFat: '',
  lifestyle: 'sitting',
  steps: '6000',
  sports: [],
  direction: 'lose',
  pace: DEFAULT_PACE.lose,
}

const MAX_SPORTS = 6
const storageKey = (uid: string) => `kalories.needs.${uid}`
const promptKey = (uid: string) => `kalories.needsPrompted.${uid}`
const text = (value: unknown) => (typeof value === 'string' ? value.slice(0, 6) : '')
const oneOf = <T extends string>(value: unknown, options: readonly T[], fallback: T): T =>
  options.find((option) => option === value) ?? fallback

function parseSession(raw: unknown, index: number): SportSession | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const count = (value: unknown, max: number, fallback: number) =>
    typeof value === 'number' && Number.isFinite(value) ? Math.min(Math.max(Math.round(value), 0), max) : fallback
  return {
    key: `s${index}-${Date.now().toString(36)}`,
    sport: oneOf(r.sport, SPORTS.map((sport) => sport.id), 'autre'),
    sessions: count(r.sessions, 14, 3),
    minutes: count(r.minutes, 300, 60),
    intensity: oneOf(r.intensity, INTENSITIES.map((level) => level.value), 'normal'),
  }
}

function load(uid: string): NeedsForm {
  try {
    const raw = JSON.parse(localStorage.getItem(storageKey(uid)) ?? 'null') as Record<string, unknown> | null
    if (!raw || typeof raw !== 'object') return EMPTY
    const direction = oneOf(raw.direction, ['lose', 'keep', 'gain'] as const, 'lose')
    const sports = Array.isArray(raw.sports) ? raw.sports.slice(0, MAX_SPORTS).map(parseSession) : []
    return {
      sex: raw.sex === 'male' || raw.sex === 'female' ? raw.sex : null,
      age: text(raw.age),
      height: text(raw.height),
      weight: text(raw.weight),
      bodyFat: text(raw.bodyFat),
      lifestyle: oneOf(raw.lifestyle, LIFESTYLES.map((option) => option.value), 'sitting'),
      steps: text(raw.steps) || EMPTY.steps,
      sports: sports.filter((session): session is SportSession => session !== null),
      direction,
      pace: oneOf(raw.pace, PACES[direction].map((pace) => pace.id), DEFAULT_PACE[direction]),
    }
  } catch {
    return EMPTY
  }
}

export function useNeedsForm(uid: string) {
  const [form, setForm] = useState(() => load(uid))

  useEffect(() => {
    try {
      localStorage.setItem(storageKey(uid), JSON.stringify(form))
    } catch {
      return
    }
  }, [uid, form])

  const update = (patch: Partial<NeedsForm>) => setForm((current) => ({ ...current, ...patch }))
  return [form, update] as const
}

export const SPORT_LIMIT = MAX_SPORTS

const decimal = (value: string) => (value.trim() ? Number(value.replace(',', '.')) : NaN)
const within = (value: number, min: number, max: number) => value >= min && value <= max

export function needsInput(form: NeedsForm): NeedsInput | null {
  const age = decimal(form.age)
  const height = decimal(form.height)
  const weight = decimal(form.weight)
  const bodyFat = decimal(form.bodyFat)
  const steps = decimal(form.steps)
  if (!form.sex || !within(age, 15, 100) || !within(height, 120, 230) || !within(weight, 30, 300)) return null
  return {
    body: { sex: form.sex, age, height, weight, bodyFat: within(bodyFat, 3, 60) ? bodyFat : null },
    lifestyle: form.lifestyle,
    steps: within(steps, 0, 60000) ? steps : 0,
    sports: form.sports,
  }
}

export function missingFields(form: NeedsForm): string[] {
  const checks: [boolean, string][] = [
    [form.sex !== null, 'sexe'],
    [within(decimal(form.age), 15, 100), 'âge (15 à 100 ans)'],
    [within(decimal(form.height), 120, 230), 'taille (120 à 230 cm)'],
    [within(decimal(form.weight), 30, 300), 'poids (30 à 300 kg)'],
  ]
  return checks.filter(([ok]) => !ok).map(([, label]) => label)
}

export function useNeedsPrompt(uid: string, done: boolean) {
  useEffect(() => {
    if (done || useAppStore.getState().overlay !== null) return
    try {
      if (localStorage.getItem(promptKey(uid))) return
      localStorage.setItem(promptKey(uid), '1')
    } catch {
      return
    }
    useAppStore.getState().setOverlay('needs')
  }, [uid, done])
}
