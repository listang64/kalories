import { useSharedRef } from '../lib/household'
import { shoppingItemsFromDoc } from '../lib/shopping'
import { useSharedDoc } from './useSharedDoc'

export function useShoppingList() {
  return useSharedDoc(useSharedRef('courses'), shoppingItemsFromDoc)
}
