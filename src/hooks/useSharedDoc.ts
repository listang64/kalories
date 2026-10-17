import { useEffect, useState } from 'react'
import { onSnapshot, type DocumentReference, type DocumentSnapshot } from 'firebase/firestore'

const RETRY_DELAY = 5000

interface SharedState<T> {
  path: string
  items: T[]
  denied: boolean
}

export function useSharedDoc<T>(
  ref: DocumentReference | null,
  parse: (snapshot: DocumentSnapshot) => T[],
): Omit<SharedState<T>, 'path'> {
  const path = ref?.path ?? ''
  const [state, setState] = useState<SharedState<T>>({ path, items: [], denied: false })

  useEffect(() => {
    if (!ref) return
    let unsubscribe = () => {}
    let timer = 0
    const subscribe = () => {
      unsubscribe = onSnapshot(
        ref,
        (snapshot) => setState({ path: ref.path, denied: false, items: parse(snapshot) }),
        (error) => {
          setState((current) => ({
            path: ref.path,
            items: current.path === ref.path ? current.items : [],
            denied: error.code === 'permission-denied',
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
  }, [ref, parse])

  return state.path === path ? state : { items: [], denied: false }
}
