import { useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { DeniedBanner } from '../components/DeniedBanner'
import { HandshakeIcon } from '../components/icons/HandshakeIcon'
import { PlusIcon } from '../components/icons/PlusIcon'
import { LoanCard } from '../components/loans/LoanCard'
import { LoanEditor, type LoanDraft } from '../components/loans/LoanEditor'
import { useLoans } from '../hooks/useLoans'
import { useToday } from '../hooks/useToday'
import { returnLoan, type Loan } from '../lib/loans'
import type { Profile } from '../lib/profiles'
import { sharedErrorMessage } from '../lib/shared'
import { useAppStore } from '../store/appStore'

interface Props {
  me: Profile
  partner: Profile | null
}

export function LoansScreen({ me, partner }: Props) {
  const { items: loans, denied } = useLoans()
  const today = useToday()
  const [draft, setDraft] = useState<LoanDraft>(null)
  const showToast = useAppStore((s) => s.showToast)
  const people = [...new Set(loans.map((loan) => loan.person))]

  const giveBack = (loan: Loan) => {
    returnLoan(loan.id).catch((error: unknown) => showToast(sharedErrorMessage(error)))
    showToast(`Rendu : ${loan.item}`)
  }

  return (
    <div className="flex h-full flex-col">
      <button
        type="button"
        onClick={() => setDraft('new')}
        className="press flex shrink-0 items-center gap-2 rounded-full border border-line bg-surface-2 py-1.5 pr-1.5 pl-4 text-left"
      >
        <span className="flex-1 text-base text-text-2">Nouveau prêt</span>
        <span className="grid size-10 place-items-center rounded-full bg-accent text-black">
          <PlusIcon size={20} strokeWidth={2} />
        </span>
      </button>
      {denied && <DeniedBanner what="aux prêts" />}
      <p className="label mt-5 h-4 shrink-0 px-1">
        {loans.length > 0 && `${loans.length} prêt${loans.length > 1 ? 's' : ''} en cours`}
      </p>
      <div className="-mx-5 mt-3 min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-5 pb-4">
        {loans.length === 0 ? (
          <div className="flex flex-col items-center gap-3 pt-14 text-center">
            <span className="text-text-2">
              <HandshakeIcon size={40} />
            </span>
            <p className="text-[17px] font-semibold">Aucun prêt en cours</p>
            <p className="max-w-64 text-[15px] text-text-2">
              {partner ? `Note ce que tu prêtes et à qui, ${partner.name} le verra aussi.` : 'Note ce que tu prêtes et à qui.'}
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2.5">
            <AnimatePresence initial={false}>
              {loans.map((loan) => (
                <LoanCard
                  key={loan.id}
                  loan={loan}
                  today={today}
                  onEdit={() => setDraft(loan)}
                  onReturn={() => giveBack(loan)}
                />
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
      {loans.length > 0 && (
        <p className="shrink-0 pt-2 text-center text-[12px] text-text-2">
          Touche un prêt pour le modifier · glisse-le à gauche quand il est rendu
        </p>
      )}
      <LoanEditor draft={draft} uid={me.uid} people={people} onReturn={giveBack} onClose={() => setDraft(null)} />
    </div>
  )
}
