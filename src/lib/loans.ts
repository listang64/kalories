import { deleteField, setDoc, updateDoc, type DocumentSnapshot } from 'firebase/firestore'
import { currentSharedDoc } from './household'
import { newId } from './shared'

export interface LoanInput {
  item: string
  person: string
  date: string
}

export interface Loan extends LoanInput {
  id: string
  lentBy: string
  order: number
}

const MAX_TEXT = 60
const DATE = /^\d{4}-\d{2}-\d{2}$/

export function isValidLoan(input: LoanInput): boolean {
  return input.item.trim() !== '' && input.person.trim() !== '' && DATE.test(input.date)
}

function clean(input: LoanInput): LoanInput {
  return {
    item: input.item.trim().slice(0, MAX_TEXT),
    person: input.person.trim().slice(0, MAX_TEXT),
    date: input.date,
  }
}

export async function addLoan(input: LoanInput, uid: string): Promise<void> {
  const loan = { ...clean(input), lentBy: uid, order: Date.now() }
  await setDoc(currentSharedDoc('prets'), { loans: { [newId()]: loan } }, { merge: true })
}

export async function updateLoan(id: string, input: LoanInput): Promise<void> {
  const loan = clean(input)
  await updateDoc(currentSharedDoc('prets'), {
    [`loans.${id}.item`]: loan.item,
    [`loans.${id}.person`]: loan.person,
    [`loans.${id}.date`]: loan.date,
  })
}

export async function returnLoan(id: string): Promise<void> {
  await updateDoc(currentSharedDoc('prets'), { [`loans.${id}`]: deleteField() })
}

function parseLoan(id: string, value: unknown): Loan | null {
  if (typeof value !== 'object' || value === null) return null
  const data = value as Record<string, unknown>
  if (typeof data.item !== 'string' || !data.item || typeof data.date !== 'string' || !DATE.test(data.date)) return null
  return {
    id,
    item: data.item,
    person: typeof data.person === 'string' ? data.person : '',
    date: data.date,
    lentBy: typeof data.lentBy === 'string' ? data.lentBy : '',
    order: typeof data.order === 'number' ? data.order : 0,
  }
}

export function loansFromDoc(snapshot: DocumentSnapshot): Loan[] {
  const loans: unknown = snapshot.get('loans')
  if (typeof loans !== 'object' || loans === null) return []
  return Object.entries(loans)
    .map(([id, value]) => parseLoan(id, value))
    .filter((loan): loan is Loan => loan !== null)
    .sort((a, b) => b.date.localeCompare(a.date) || b.order - a.order)
}
