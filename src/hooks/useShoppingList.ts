import { useEffect, useState } from 'react'
import { onSnapshot } from 'firebase/firestore'
import { shoppingDoc, shoppingItemsFromDoc, type ShoppingItem } from '../lib/shopping'

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
        shoppingDoc,
        (snapshot) => setState({ denied: false, items: shoppingItemsFromDoc(snapshot) }),
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
