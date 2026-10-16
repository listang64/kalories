import { useEffect, useState } from 'react'
import { onSnapshot } from 'firebase/firestore'
import { shoppingCollection, shoppingItemFromDoc, type ShoppingItem } from '../lib/shopping'

const RETRY_DELAY = 5000

interface ShoppingState {
  items: ShoppingItem[]
  denied: boolean
}

export function useShoppingList(): ShoppingState {
  const [state, setState] = useState<ShoppingState>({ items: [], denied: false })

  useEffect(() => {
    let unsubscribe = () => {}
    let timer = 0
    const subscribe = () => {
      unsubscribe = onSnapshot(
        shoppingCollection,
        (snapshot) =>
          setState({
            denied: false,
            items: snapshot.docs
              .map(shoppingItemFromDoc)
              .filter((item): item is ShoppingItem => item !== null)
              .sort((a, b) => a.order - b.order),
          }),
        (error) => {
          setState((current) => ({ ...current, denied: error.code === 'permission-denied' }))
          timer = window.setTimeout(subscribe, RETRY_DELAY)
        },
      )
    }
    subscribe()
    return () => {
      window.clearTimeout(timer)
      unsubscribe()
    }
  }, [])

  return state
}
