import { loansDoc, loansFromDoc } from '../lib/loans'
import { useSharedDoc } from './useSharedDoc'

export function useLoans() {
  return useSharedDoc(loansDoc, loansFromDoc)
}
