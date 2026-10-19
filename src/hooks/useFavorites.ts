import { useEffect, useState } from 'react'
import { onSnapshot } from 'firebase/firestore'
import { favoriteFromDoc, favoritesOf, type Favorite } from '../lib/favorites'

interface FavoritesState {
  uid: string
  loaded: boolean
  favorites: Favorite[]
}

export function useFavorites(uid: string): Omit<FavoritesState, 'uid'> {
  const [state, setState] = useState<FavoritesState>({ uid, loaded: false, favorites: [] })

  useEffect(
    () =>
      onSnapshot(
        favoritesOf(uid),
        (snapshot) => {
          const favorites = snapshot.docs
            .map(favoriteFromDoc)
            .filter((favorite): favorite is Favorite => favorite !== null)
            .sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }))
          setState({ uid, loaded: true, favorites })
        },
        () =>
          setState((current) => ({ uid, loaded: true, favorites: current.uid === uid ? current.favorites : [] })),
      ),
    [uid],
  )

  return state.uid === uid ? state : { loaded: false, favorites: [] }
}
