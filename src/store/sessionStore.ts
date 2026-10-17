import { create } from 'zustand'
import type { Profile } from '../lib/profiles'

export type SessionStatus = 'loading' | 'signedOut' | 'migrating' | 'incomplete' | 'ready'

export interface SessionState {
  status: SessionStatus
  uid: string | null
  householdId: string | null
  people: Profile[]
}

export const SIGNED_OUT: SessionState = { status: 'signedOut', uid: null, householdId: null, people: [] }

export const useSession = create<SessionState>()(() => ({ ...SIGNED_OUT, status: 'loading' }))

export function useMe(): Profile | null {
  return useSession((s) => s.people.find((person) => person.uid === s.uid) ?? null)
}

export function usePerson(uid: string): Profile | undefined {
  return useSession((s) => s.people.find((person) => person.uid === uid))
}
