import { shoppingDoc, shoppingItemsFromDoc } from '../lib/shopping'
import { useSharedDoc } from './useSharedDoc'

export function useShoppingList() {
  return useSharedDoc(shoppingDoc, shoppingItemsFromDoc)
}
