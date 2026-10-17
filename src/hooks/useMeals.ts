import { useEffect, useMemo, useState } from 'react'
import { onSnapshot, query, where } from 'firebase/firestore'
import { mealFromDoc, mealsOf, type Meal } from '../lib/meals'

interface MealsState {
  key: string
  byUid: Record<string, Meal[]>
}

export function useMeals(uids: string[], start: string, end = start): Meal[] {
  const key = `${uids.join(',')}|${start}|${end}`
  const [state, setState] = useState<MealsState>({ key, byUid: {} })

  useEffect(() => {
    const [ids = '', from = '', to = ''] = key.split('|')
    const stops = ids
      .split(',')
      .filter(Boolean)
      .map((uid) =>
        onSnapshot(
          query(mealsOf(uid), where('date', '>=', from), where('date', '<=', to)),
          (snapshot) => {
            const meals = snapshot.docs.map(mealFromDoc).filter((meal): meal is Meal => meal !== null)
            setState((current) => ({ key, byUid: { ...(current.key === key ? current.byUid : {}), [uid]: meals } }))
          },
          () => undefined,
        ),
      )
    return () => stops.forEach((stop) => stop())
  }, [key])

  return useMemo(
    () =>
      state.key === key
        ? Object.values(state.byUid)
            .flat()
            .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        : [],
    [state, key],
  )
}
