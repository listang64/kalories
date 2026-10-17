import { useSharedRef } from '../lib/household'
import { loansFromDoc } from '../lib/loans'
import { useSharedDoc } from './useSharedDoc'

export function useLoans() {
  return useSharedDoc(useSharedRef('prets'), loansFromDoc)
}
