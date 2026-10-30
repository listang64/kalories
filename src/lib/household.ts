import { useEffect, useMemo, useState } from 'react'
import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDocFromServer,
  getDocsFromServer,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
  type DocumentData,
  type DocumentReference,
} from 'firebase/firestore'
import { colorById, type ColorId } from '../config/colors'
import { db } from '../config/firebase'
import { useSession } from '../store/sessionStore'
import type { Profile } from './profiles'
import { recipesOf } from './recipes'
import { refreshHousehold } from './session'
import { shareText, type ShareResult } from './share'
import { normalizeCode, randomCode } from './shared'

export type SharedName = 'courses' | 'prets' | 'ecrans' | 'imposteur'

export function sharedDoc(householdId: string, name: SharedName): DocumentReference {
  return doc(db, 'households', householdId, 'shared', name)
}

export function currentSharedDoc(name: SharedName): DocumentReference {
  const householdId = useSession.getState().householdId
  if (!householdId) throw new Error('Aucun foyer')
  return sharedDoc(householdId, name)
}

export function useSharedRef(name: SharedName): DocumentReference | null {
  const householdId = useSession((s) => s.householdId)
  return useMemo(() => (householdId ? sharedDoc(householdId, name) : null), [householdId, name])
}

export interface Invite {
  code: string
  householdId: string
  createdBy: string
  createdByName: string
  createdByColor: ColorId
  expiresAt: number
}

export type InviteLookup = { status: 'found'; invite: Invite } | { status: 'unknown' | 'expired' | 'offline' }

const LIFETIME = 48 * 3600 * 1000

export function normalizeInviteCode(text: string): string {
  return normalizeCode(text)
}

function parseInvite(code: string, data: DocumentData | undefined): Invite | null {
  const created = data?.createdAt as { toMillis?: () => number } | undefined
  if (typeof data?.householdId !== 'string' || typeof data.createdBy !== 'string') return null
  return {
    code,
    householdId: data.householdId,
    createdBy: data.createdBy,
    createdByName: typeof data.createdByName === 'string' ? data.createdByName : '',
    createdByColor: colorById(data.createdByColor).id,
    expiresAt: (created?.toMillis?.() ?? Date.now()) + LIFETIME,
  }
}

export async function createInvite(me: Profile): Promise<void> {
  if (!me.householdId) throw new Error('Aucun foyer')
  const previous = await getDocsFromServer(query(collection(db, 'invites'), where('createdBy', '==', me.uid)))
  await Promise.all(previous.docs.map((invite) => deleteDoc(invite.ref)))
  await setDoc(doc(db, 'invites', randomCode()), {
    householdId: me.householdId,
    createdBy: me.uid,
    createdByName: me.name,
    createdByColor: me.color,
    createdAt: serverTimestamp(),
  })
}

export function useMyInvite(uid: string): Invite | null {
  const [invites, setInvites] = useState<Invite[]>([])

  useEffect(
    () =>
      onSnapshot(
        query(collection(db, 'invites'), where('createdBy', '==', uid)),
        (snapshot) =>
          setInvites(
            snapshot.docs
              .map((invite) => parseInvite(invite.id, invite.data({ serverTimestamps: 'estimate' })))
              .filter((invite): invite is Invite => invite !== null),
          ),
        () => setInvites([]),
      ),
    [uid],
  )

  const now = Date.now()
  return invites.filter((invite) => invite.expiresAt > now).sort((a, b) => b.expiresAt - a.expiresAt)[0] ?? null
}

export function formatExpiry(time: number): string {
  return new Date(time).toLocaleString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
}

export function shareHouseholdInvite(invite: Invite): Promise<ShareResult> {
  return shareText(
    `Rejoins mon foyer sur Kalories : dans Paramètres → Mon foyer → Rejoindre un foyer, entre le code ${invite.code} (valable jusqu’au ${formatExpiry(invite.expiresAt)}).`,
  )
}

export function cancelInvite(code: string): Promise<void> {
  return deleteDoc(doc(db, 'invites', code))
}

export async function findInvite(code: string): Promise<InviteLookup> {
  if (!/^[A-Z0-9]{6}$/.test(code)) return { status: 'unknown' }
  try {
    const snapshot = await getDocFromServer(doc(db, 'invites', code))
    const invite = parseInvite(code, snapshot.data())
    if (!invite) return { status: 'unknown' }
    return invite.expiresAt > Date.now() ? { status: 'found', invite } : { status: 'expired' }
  } catch {
    return { status: 'offline' }
  }
}

function field(data: DocumentData | undefined, name: string): Record<string, unknown> {
  const value: unknown = data?.[name]
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {}
}

export async function joinHousehold(me: Profile, invite: Invite, color: ColorId): Promise<void> {
  const previous = me.householdId
  if (!previous) throw new Error('Aucun foyer')
  const [courses, loans, screens, recipes] = await Promise.all([
    getDocFromServer(sharedDoc(previous, 'courses')),
    getDocFromServer(sharedDoc(previous, 'prets')),
    getDocFromServer(sharedDoc(previous, 'ecrans')),
    getDocsFromServer(recipesOf(previous)),
  ])
  const items = field(courses.data(), 'items')
  const lent = field(loans.data(), 'loans')
  const titles = field(screens.data(), 'titles')
  const batch = writeBatch(db)
  batch.update(doc(db, 'households', invite.householdId), { members: arrayUnion(me.uid), invite: invite.code })
  batch.update(doc(db, 'users', me.uid), { householdId: invite.householdId, color })
  batch.delete(doc(db, 'invites', invite.code))
  if (Object.keys(items).length > 0) batch.set(sharedDoc(invite.householdId, 'courses'), { items }, { merge: true })
  if (Object.keys(lent).length > 0) batch.set(sharedDoc(invite.householdId, 'prets'), { loans: lent }, { merge: true })
  if (Object.keys(titles).length > 0) batch.set(sharedDoc(invite.householdId, 'ecrans'), { titles }, { merge: true })
  recipes.docs.forEach((recipe) => {
    batch.set(doc(recipesOf(invite.householdId), recipe.id), recipe.data())
    batch.delete(recipe.ref)
  })
  batch.delete(sharedDoc(previous, 'courses'))
  batch.delete(sharedDoc(previous, 'prets'))
  batch.delete(sharedDoc(previous, 'ecrans'))
  batch.delete(doc(db, 'households', previous))
  await batch.commit()
  refreshHousehold()
}

export async function leaveHousehold(me: Profile): Promise<void> {
  if (!me.householdId) throw new Error('Aucun foyer')
  const householdId = doc(collection(db, 'households')).id
  const batch = writeBatch(db)
  batch.update(doc(db, 'households', me.householdId), { members: arrayRemove(me.uid) })
  batch.set(doc(db, 'households', householdId), { members: [me.uid], createdAt: serverTimestamp() })
  batch.update(doc(db, 'users', me.uid), { householdId })
  await batch.commit()
}
