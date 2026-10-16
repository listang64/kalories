import { useState } from 'react'
import { todayKey } from '../../lib/dates'
import { addLoan, isValidLoan, updateLoan, type Loan } from '../../lib/loans'
import { sharedErrorMessage } from '../../lib/shared'
import { useAppStore } from '../../store/appStore'
import { BottomPanel } from '../BottomPanel'
import { Field, FIELD_INPUT } from '../Field'

export type LoanDraft = Loan | 'new' | null

interface Props {
  draft: LoanDraft
  uid: string
  people: string[]
  onReturn: (loan: Loan) => void
  onClose: () => void
}

export function LoanEditor({ draft, uid, people, onReturn, onClose }: Props) {
  return (
    <BottomPanel
      open={draft !== null}
      label={draft === 'new' ? 'Nouveau prêt' : 'Modifier le prêt'}
      onClose={onClose}
    >
      {draft && (
        <LoanForm
          key={draft === 'new' ? 'new' : draft.id}
          loan={draft === 'new' ? null : draft}
          uid={uid}
          people={people}
          onReturn={onReturn}
          onClose={onClose}
        />
      )}
    </BottomPanel>
  )
}

type FormProps = Omit<Props, 'draft'> & { loan: Loan | null }

function LoanForm({ loan, uid, people, onReturn, onClose }: FormProps) {
  const [item, setItem] = useState(loan?.item ?? '')
  const [person, setPerson] = useState(loan?.person ?? '')
  const [date, setDate] = useState(loan?.date ?? todayKey())
  const showToast = useAppStore((s) => s.showToast)
  const fail = (error: unknown) => showToast(sharedErrorMessage(error))
  const input = { item, person, date }

  const save = () => {
    if (!isValidLoan(input)) return
    const request = loan ? updateLoan(loan.id, input) : addLoan(input, uid)
    request.catch(fail)
    onClose()
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        save()
      }}
      className="mt-4 flex flex-col gap-3"
    >
      <h3 className="text-[17px] font-semibold">{loan ? 'Modifier le prêt' : 'Nouveau prêt'}</h3>
      <Field label="Objet">
        <input
          value={item}
          onChange={(e) => setItem(e.target.value)}
          maxLength={60}
          placeholder="ex. Perceuse, livre, tente"
          enterKeyHint="next"
          autoCapitalize="sentences"
          className={FIELD_INPUT}
        />
      </Field>
      <Field label="Prêté à">
        <input
          value={person}
          onChange={(e) => setPerson(e.target.value)}
          maxLength={60}
          placeholder="Prénom"
          list="loan-people"
          enterKeyHint="next"
          autoCapitalize="words"
          className={FIELD_INPUT}
        />
        <datalist id="loan-people">
          {people.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
      </Field>
      <Field label="Date">
        <input
          type="date"
          value={date}
          max={todayKey()}
          onChange={(e) => setDate(e.target.value)}
          className={`${FIELD_INPUT} [&::-webkit-date-and-time-value]:text-left`}
        />
      </Field>
      <div className={`mt-2 grid gap-2.5 ${loan ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {loan && (
          <button
            type="button"
            onClick={() => {
              onReturn(loan)
              onClose()
            }}
            className="press h-12 rounded-full bg-white/8 text-[15px] font-medium text-accent"
          >
            Rendu
          </button>
        )}
        <button
          type="submit"
          disabled={!isValidLoan(input)}
          className="press h-12 rounded-full bg-accent text-[15px] font-semibold text-black disabled:opacity-40"
        >
          {loan ? 'Enregistrer' : 'Ajouter le prêt'}
        </button>
      </div>
    </form>
  )
}
