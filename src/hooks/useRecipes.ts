import { useEffect, useState } from 'react'
import { onSnapshot } from 'firebase/firestore'
import { recipeFromDoc, recipesOf, type Recipe } from '../lib/recipes'

const RETRY_DELAY = 5000

interface RecipesState {
  householdId: string
  loaded: boolean
  recipes: Recipe[]
}

export function useRecipes(householdId: string): Omit<RecipesState, 'householdId'> {
  const [state, setState] = useState<RecipesState>({ householdId, loaded: false, recipes: [] })

  useEffect(() => {
    let unsubscribe = () => {}
    let timer = 0
    const subscribe = () => {
      unsubscribe = onSnapshot(
        recipesOf(householdId),
        (snapshot) => {
          const recipes = snapshot.docs
            .map(recipeFromDoc)
            .filter((recipe): recipe is Recipe => recipe !== null)
            .sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }))
          setState({ householdId, loaded: true, recipes })
        },
        () => {
          setState((current) => ({
            householdId,
            loaded: true,
            recipes: current.householdId === householdId ? current.recipes : [],
          }))
          timer = window.setTimeout(subscribe, RETRY_DELAY)
        },
      )
    }
    subscribe()
    return () => {
      window.clearTimeout(timer)
      unsubscribe()
    }
  }, [householdId])

  return state.householdId === householdId ? state : { loaded: false, recipes: [] }
}
