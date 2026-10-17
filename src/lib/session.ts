import { onAuthStateChanged, type User } from 'firebase/auth'
import { doc, onSnapshot, type DocumentSnapshot } from 'firebase/firestore'
import { auth, db } from '../config/firebase'
import { SIGNED_OUT, useSession, type SessionState } from '../store/sessionStore'
import { isCouple, migrateCouple, moveLegacyData } from './migration'
import { parseProfile, type Profile } from './profiles'

const CACHE_KEY = 'kalories.session'
const RETRY_DELAY = 5000

interface Watch {
  uid: string
  householdId: string | null
  members: string[] | null
  profiles: Map<string, Profile | null>
  stops: Map<string, () => void>
  timers: number[]
  migrating: boolean
  legacyMoved: boolean
}

let current: Watch | null = null

function readCache(): SessionState | null {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'null') as Partial<SessionState> | null
    if (typeof cached?.uid !== 'string' || typeof cached.householdId !== 'string' || !Array.isArray(cached.people)) return null
    const people = cached.people
      .filter((person: Partial<Profile>) => typeof person?.uid === 'string')
      .map((person: Profile) => parseProfile(person.uid, person))
    if (!people.some((person) => person.uid === cached.uid)) return null
    return { status: 'ready', uid: cached.uid, householdId: cached.householdId, people }
  } catch {
    return null
  }
}

function writeCache(state: SessionState) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ uid: state.uid, householdId: state.householdId, people: state.people }))
  } catch {
    return
  }
}

function stop(watch: Watch, key: string) {
  watch.stops.get(key)?.()
  watch.stops.delete(key)
}

function stopAll(watch: Watch) {
  watch.stops.forEach((unsubscribe) => unsubscribe())
  watch.stops.clear()
  watch.timers.forEach((timer) => window.clearTimeout(timer))
}

function later(watch: Watch, task: () => void) {
  watch.timers.push(window.setTimeout(() => current === watch && task(), RETRY_DELAY))
}

function publish(watch: Watch) {
  const me = watch.profiles.get(watch.uid)
  if (!me?.householdId || !watch.members) return
  const order = watch.members.includes(watch.uid) ? watch.members : [watch.uid]
  if (order.some((uid) => !watch.profiles.has(uid))) return
  const people = order.map((uid) => watch.profiles.get(uid)).filter((person): person is Profile => !!person)
  const state: SessionState = { status: 'ready', uid: watch.uid, householdId: me.householdId, people }
  useSession.setState(state)
  writeCache(state)
  if (isCouple(watch.uid) && !watch.legacyMoved) {
    watch.legacyMoved = true
    moveLegacyData(me.householdId).catch(() => (watch.legacyMoved = false))
  }
}

function watchMember(watch: Watch, uid: string) {
  const key = `member:${uid}`
  if (watch.stops.has(key)) return
  const unsubscribe = onSnapshot(
    doc(db, 'users', uid),
    (snapshot) => {
      watch.profiles.set(uid, snapshot.exists() ? parseProfile(uid, snapshot.data()) : null)
      publish(watch)
    },
    () => {
      stop(watch, key)
      watch.profiles.set(uid, null)
      publish(watch)
      later(watch, () => watch.members?.includes(uid) && watchMember(watch, uid))
    },
  )
  watch.stops.set(key, unsubscribe)
}

function watchHousehold(watch: Watch, householdId: string) {
  stop(watch, 'household')
  watch.householdId = householdId
  watch.members = null
  const unsubscribe = onSnapshot(
    doc(db, 'households', householdId),
    (snapshot) => {
      if (!snapshot.exists()) return
      const members: unknown = snapshot.get('members')
      watch.members = Array.isArray(members) ? members.filter((uid): uid is string => typeof uid === 'string') : []
      for (const key of [...watch.stops.keys()]) {
        const uid = key.startsWith('member:') ? key.slice(7) : null
        if (uid && !watch.members.includes(uid)) {
          stop(watch, key)
          watch.profiles.delete(uid)
        }
      }
      watch.members.filter((uid) => uid !== watch.uid).forEach((uid) => watchMember(watch, uid))
      publish(watch)
    },
    () => later(watch, () => watch.householdId === householdId && watchHousehold(watch, householdId)),
  )
  watch.stops.set('household', unsubscribe)
}

function migrate(watch: Watch) {
  if (watch.migrating) return
  watch.migrating = true
  useSession.setState({ ...SIGNED_OUT, status: 'migrating', uid: watch.uid })
  migrateCouple()
    .catch(() => later(watch, () => migrate(watch)))
    .finally(() => (watch.migrating = false))
}

function onProfile(watch: Watch, snapshot: DocumentSnapshot) {
  const profile = snapshot.exists() ? parseProfile(watch.uid, snapshot.data()) : null
  if (!profile?.householdId) {
    if (isCouple(watch.uid)) {
      if (snapshot.metadata.fromCache) useSession.setState({ ...SIGNED_OUT, status: 'migrating', uid: watch.uid })
      else migrate(watch)
    } else if (!snapshot.metadata.fromCache) {
      useSession.setState({ ...SIGNED_OUT, status: 'incomplete', uid: watch.uid })
    }
    return
  }
  watch.profiles.set(watch.uid, profile)
  if (profile.householdId !== watch.householdId) watchHousehold(watch, profile.householdId)
  publish(watch)
}

function watchProfile(watch: Watch) {
  const unsubscribe = onSnapshot(
    doc(db, 'users', watch.uid),
    { includeMetadataChanges: true },
    (snapshot) => onProfile(watch, snapshot),
    () => later(watch, () => watchProfile(watch)),
  )
  watch.stops.set('profile', unsubscribe)
}

function onUser(user: User | null) {
  if (current) stopAll(current)
  current = null
  if (!user) {
    localStorage.removeItem(CACHE_KEY)
    useSession.setState(SIGNED_OUT)
    return
  }
  if (useSession.getState().uid !== user.uid) useSession.setState({ ...SIGNED_OUT, status: 'loading', uid: user.uid })
  current = {
    uid: user.uid,
    householdId: null,
    members: null,
    profiles: new Map(),
    stops: new Map(),
    timers: [],
    migrating: false,
    legacyMoved: false,
  }
  watchProfile(current)
}

export function refreshHousehold() {
  if (current?.householdId) watchHousehold(current, current.householdId)
}

export function watchSession() {
  localStorage.removeItem('kalories.profile')
  const cached = readCache()
  if (cached) useSession.setState(cached)
  onAuthStateChanged(auth, onUser)
}
