import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import type { PersonEntry } from './useHomeData'
import { useToday } from './useToday'

export interface Burst {
  id: number
  uid: string
  from: number
  to: number
}

interface Seen {
  day: string
  values: Record<string, number>
}

const SETTLE = 450
const OPENING = 1300
const TRAVEL = 1150
const WARMUP = 3000
const SEEN_KEY = 'kalories.seen'

const snapshot = (entries: PersonEntry[]): Record<string, number> =>
  Object.fromEntries(entries.map((entry) => [entry.profile.uid, entry.day.totals.kcal]))

const pick = (values: Record<string, number>, keys: string[]) => Object.fromEntries(keys.map((key) => [key, values[key] ?? 0]))

function loadSeen(day: string): Record<string, number> {
  try {
    const saved = JSON.parse(localStorage.getItem(SEEN_KEY) ?? 'null') as Seen | null
    return saved?.day === day && typeof saved.values === 'object' ? saved.values : {}
  } catch {
    return {}
  }
}

function saveSeen(seen: Seen) {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify(seen))
  } catch {
    return
  }
}

const opening = (entries: PersonEntry[], day: string): Seen => {
  const saved = loadSeen(day)
  return { day, values: Object.fromEntries(entries.map(({ profile }) => [profile.uid, saved[profile.uid] ?? 0])) }
}

export function useFeedBursts(entries: PersonEntry[], blocked: boolean) {
  const day = useToday()
  const reduce = useReducedMotion() === true
  const [seen, setSeen] = useState(() => opening(entries, day))
  const [bursts, setBursts] = useState<Burst[]>([])
  const [pulse, setPulse] = useState(0)
  const [armed, setArmed] = useState(false)
  const seq = useRef(0)
  const flying = useRef<Record<string, number>>({})
  if (seen.day !== day) setSeen(opening(entries, day))
  const shown = seen.values
  const key = entries.map((entry) => `${entry.profile.uid}:${Math.round(entry.day.totals.kcal)}`).join('|')
  const reveal = (values: Record<string, number>) =>
    setSeen((current) => ({ day: current.day, values: { ...current.values, ...values } }))

  useEffect(() => {
    const timer = window.setTimeout(() => setArmed(true), WARMUP)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => saveSeen(seen), [seen])

  useEffect(() => {
    const target = snapshot(entries)
    const gap = (uid: string) => (target[uid] ?? 0) - (shown[uid] ?? 0)
    const moved = Object.keys(target).filter((uid) => flying.current[uid] !== target[uid] && target[uid] !== shown[uid])
    const risers = moved.filter((uid) => gap(uid) > 1)
    const fallers = moved.filter((uid) => armed && uid in shown && gap(uid) < -1)
    const movers = [...risers, ...fallers]
    const others = moved.filter((uid) => !movers.includes(uid) && (armed || !(uid in shown)))
    if (others.length) reveal(pick(target, others))
    if (movers.length === 0) return
    if (reduce) return reveal(pick(target, movers))
    if (blocked) return
    const launch = window.setTimeout(() => {
      const fresh = movers.map((uid) => ({ id: ++seq.current, uid, from: shown[uid] ?? 0, to: target[uid] ?? 0 }))
      movers.forEach((uid) => (flying.current[uid] = target[uid] ?? 0))
      setBursts((current) => [...current, ...fresh])
      if (risers.length) setPulse((count) => count + 1)
      if (fallers.length) reveal(pick(target, fallers))
      window.setTimeout(() => {
        if (risers.length) reveal(pick(target, risers))
        if (fallers.length) setPulse((count) => count + 1)
        movers.forEach((uid) => flying.current[uid] === target[uid] && delete flying.current[uid])
      }, TRAVEL)
    }, armed ? SETTLE : OPENING)
    return () => window.clearTimeout(launch)
  }, [key, blocked, reduce, armed, seen.day])

  const done = (id: number) => setBursts((current) => current.filter((burst) => burst.id !== id))
  return { shown, bursts, done, pulse }
}
