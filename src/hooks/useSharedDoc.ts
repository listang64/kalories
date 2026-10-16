import { useEffect, useState } from 'react'
import { onSnapshot, type DocumentReference, type DocumentSnapshot } from 'firebase/firestore'

const RETRY_DELAY = 5000

interface SharedState<T> {
  items: T[]
  denied: boolean
}

export function useSharedDoc<T>(ref: DocumentReference, parse: (snapshot: DocumentSnapshot) => T[]): SharedState<T> {
  const [state, setState] = useState<SharedState<T>>({ items: [], denied: false })

  useEffect(() => {
    let unsubscribe = () => {}
    let timer = 0
    const subscribe = () => {
      unsubscribe = onSnapshot(
        ref,
        (snapshot) => setState({ denied: false, items: parse(snapshot) }),
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
  }, [ref, parse])

  return state
}
