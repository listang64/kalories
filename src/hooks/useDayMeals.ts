import { useEffect, useState } from 'react'
import { onSnapshot, query, where } from 'firebase/firestore'
import { mealFromDoc, mealsCollection, type Meal } from '../lib/meals'

interface DayMeals {
  date: string
  meals: Meal[]
}

export function useDayMeals(date: string): Meal[] {
  const [state, setState] = useState<DayMeals>({ date, meals: [] })

  useEffect(() => {
    return onSnapshot(
      query(mealsCollection, where('date', '==', date)),
      (snapshot) => {
        const meals = snapshot.docs
          .map(mealFromDoc)
          .filter((meal): meal is Meal => meal !== null)
          .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        setState({ date, meals })
      },
      () => undefined,
    )
  }, [date])

  return state.date === date ? state.meals : []
}
