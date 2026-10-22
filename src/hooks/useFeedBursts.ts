import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import type { PersonEntry } from './useHomeData'

export interface Burst {
  id: number
  uid: string
  from: number
  to: number
}

const SETTLE = 450
const TRAVEL = 1150
const WARMUP = 3000

const snapshot = (entries: PersonEntry[]): Record<string, number> =>
  Object.fromEntries(entries.map((entry) => [entry.profile.uid, entry.day.totals.kcal]))

const pick = (values: Record<string, number>, keys: string[]) => Object.fromEntries(keys.map((key) => [key, values[key] ?? 0]))

export function useFeedBursts(entries: PersonEntry[], blocked: boolean) {
  const reduce = useReducedMotion() === true
  const [shown, setShown] = useState(() => snapshot(entries))
  const [bursts, setBursts] = useState<Burst[]>([])
  const [pulse, setPulse] = useState(0)
  const seq = useRef(0)
  const armed = useRef(false)
  const key = entries.map((entry) => `${entry.profile.uid}:${Math.round(entry.day.totals.kcal)}`).join('|')

  useEffect(() => {
    const timer = window.setTimeout(() => (armed.current = true), WARMUP)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const target = snapshot(entries)
    const uids = Object.keys(target)
    const risers = uids.filter((uid) => uid in shown && (target[uid] ?? 0) > (shown[uid] ?? 0) + 1)
    const others = uids.filter((uid) => !risers.includes(uid) && target[uid] !== shown[uid])
    if (others.length) setShown((current) => ({ ...current, ...pick(target, others) }))
    if (risers.length === 0) return
    if (reduce || !armed.current) return setShown((current) => ({ ...current, ...pick(target, risers) }))
    if (blocked) return
    const launch = window.setTimeout(() => {
      const fresh = risers.map((uid) => ({ id: ++seq.current, uid, from: shown[uid] ?? 0, to: target[uid] ?? 0 }))
      setBursts((current) => [...current, ...fresh])
      setPulse((count) => count + 1)
    }, SETTLE)
    const land = window.setTimeout(() => setShown((current) => ({ ...current, ...pick(target, risers) })), SETTLE + TRAVEL)
    return () => {
      window.clearTimeout(launch)
      window.clearTimeout(land)
    }
  }, [key, blocked, reduce])

  const done = (id: number) => setBursts((current) => current.filter((burst) => burst.id !== id))
  return { shown, bursts, done, pulse }
}
