import { collection, deleteField, doc, setDoc } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { completeSlots } from './time'
import { dayOf, monthOf, type Balance, type DayEntry, type WeekDay } from './model'

export const SETTINGS_DOC = 'reglages'

export const hoursOf = (uid: string) => collection(db, 'users', uid, 'horaires')

const settingsRef = (uid: string) => doc(hoursOf(uid), SETTINGS_DOC)

export function saveDay(uid: string, date: string, entry: DayEntry): Promise<void> {
  const clean: DayEntry = {
    slots: entry.off ? [] : completeSlots(entry.slots),
    meal: entry.off ? false : entry.meal,
    off: entry.off,
    note: entry.note.trim().slice(0, 400),
  }
  return setDoc(doc(hoursOf(uid), monthOf(date)), { days: { [dayOf(date)]: clean } }, { merge: true })
}

export function clearDay(uid: string, date: string): Promise<void> {
  return setDoc(doc(hoursOf(uid), monthOf(date)), { days: { [dayOf(date)]: deleteField() } }, { merge: true })
}

export function saveName(uid: string, firstName: string, lastName: string): Promise<void> {
  return setDoc(settingsRef(uid), { firstName: firstName.trim().slice(0, 40), lastName: lastName.trim().slice(0, 40) }, { merge: true })
}

export function saveWeekDay(uid: string, key: string, day: WeekDay): Promise<void> {
  return setDoc(settingsRef(uid), { week: { [key]: day } }, { merge: true })
}

export function saveTarget(uid: string, month: string, hours: number | null): Promise<void> {
  return setDoc(settingsRef(uid), { targets: { [month]: hours ?? deleteField() } }, { merge: true })
}

export function saveBalance(uid: string, balance: Balance | null): Promise<void> {
  return setDoc(settingsRef(uid), { balance }, { merge: true })
}
