import { useEffect, useState } from 'react'
import { onSnapshot } from 'firebase/firestore'
import { shoppingCollection, shoppingItemFromDoc, type ShoppingItem } from '../lib/shopping'

export function useShoppingList(): ShoppingItem[] {
  const [items, setItems] = useState<ShoppingItem[]>([])

  useEffect(
    () =>
      onSnapshot(
        shoppingCollection,
        (snapshot) =>
          setItems(
            snapshot.docs
              .map(shoppingItemFromDoc)
              .filter((item): item is ShoppingItem => item !== null)
              .sort((a, b) => a.order - b.order),
          ),
        () => undefined,
      ),
    [],
  )

  return items
}
