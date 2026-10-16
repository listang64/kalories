import { useEffect, useState } from 'react'
import { onSnapshot, query, where } from 'firebase/firestore'
import { mealFromDoc, mealsCollection, type Meal } from '../lib/meals'

interface RangeMeals {
  key: string
  meals: Meal[]
}

export function useMealsRange(start: string, end: string): Meal[] {
  const key = `${start}|${end}`
  const [state, setState] = useState<RangeMeals>({ key, meals: [] })

  useEffect(
    () =>
      onSnapshot(
        query(mealsCollection, where('date', '>=', start), where('date', '<=', end)),
        (snapshot) =>
          setState({
            key,
            meals: snapshot.docs.map(mealFromDoc).filter((meal): meal is Meal => meal !== null),
          }),
        () => undefined,
      ),
    [start, end, key],
  )

  return state.key === key ? state.meals : []
}
