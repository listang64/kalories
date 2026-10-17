import { createUserWithEmailAndPassword, deleteUser, type User } from 'firebase/auth'
import { collection, doc, getDocFromServer, serverTimestamp, writeBatch } from 'firebase/firestore'
import type { ColorId } from '../config/colors'
import { auth, db } from '../config/firebase'
import { useSession, useSignup, type SessionState, type SessionStatus } from '../store/sessionStore'
import { cleanEmail, rememberEmail } from './auth'

export type CodeCheck = 'ok' | 'used' | 'unknown' | 'offline'

export interface ProfileInput {
  code: string
  name: string
  color: ColorId
  kcal: number
}

const STATUS_TIMEOUT = 10000

export function normalizeCode(text: string): string {
  const raw = text.toUpperCase().replace(/[^A-Z0-9]/g, '')
  return raw.length === 8 ? `${raw.slice(0, 4)}-${raw.slice(4)}` : raw
}

export async function checkSignupCode(code: string): Promise<CodeCheck> {
  if (!/^[A-Z0-9-]{4,24}$/.test(code)) return 'unknown'
  try {
    const snapshot = await getDocFromServer(doc(db, 'signupCodes', code))
    if (!snapshot.exists()) return 'unknown'
    return snapshot.get('usedBy') ? 'used' : 'ok'
  } catch {
    return 'offline'
  }
}

function waitForStatus(uid: string, status: SessionStatus): Promise<void> {
  const reached = (s: SessionState) => s.status === status && s.uid === uid
  if (reached(useSession.getState())) return Promise.resolve()
  return new Promise((resolve) => {
    const done = () => {
      window.clearTimeout(timer)
      unsubscribe()
      resolve()
    }
    const timer = window.setTimeout(done, STATUS_TIMEOUT)
    const unsubscribe = useSession.subscribe((s) => reached(s) && done())
  })
}

export async function createProfile(user: User, input: ProfileInput): Promise<void> {
  const name = input.name.trim().slice(0, 24)
  const householdId = doc(collection(db, 'households')).id
  const batch = writeBatch(db)
  batch.update(doc(db, 'signupCodes', input.code), { usedBy: user.uid, usedName: name, usedAt: serverTimestamp() })
  batch.set(doc(db, 'households', householdId), { members: [user.uid], createdAt: serverTimestamp() })
  batch.set(doc(db, 'users', user.uid), {
    name,
    color: input.color,
    householdId,
    signupCode: input.code,
    dailyKcalGoal: input.kcal,
    macroMode: 'auto',
  })
  await batch.commit()
  await waitForStatus(user.uid, 'ready')
}

export async function signUp(email: string, password: string, input: ProfileInput): Promise<void> {
  useSignup.setState({ busy: true })
  try {
    const { user } = await createUserWithEmailAndPassword(auth, cleanEmail(email), password)
    await waitForStatus(user.uid, 'incomplete')
    try {
      await createProfile(user, input)
    } catch (error) {
      await deleteUser(user).catch(() => undefined)
      throw error
    }
    rememberEmail(email)
  } finally {
    useSignup.setState({ busy: false })
  }
}
