import { motion } from 'motion/react'
import { profileByUid } from '../../config/users'
import { daysBetween, formatShortDate, formatSince } from '../../lib/dates'
import type { Loan } from '../../lib/loans'
import { CheckIcon } from '../icons/CheckIcon'
import { SwipeButton } from '../SwipeButton'

interface Props {
  loan: Loan
  today: string
  onEdit: () => void
  onReturn: () => void
}

const LONG_LOAN = 30

export function LoanCard({ loan, today, onEdit, onReturn }: Props) {
  const days = daysBetween(loan.date, today)
  const since = formatSince(days)
  const lender = profileByUid(loan.lentBy)

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ x: -200, opacity: 0, transition: { duration: 0.22 } }}
      transition={{ type: 'spring', stiffness: 480, damping: 34 }}
      className="list-none"
    >
      <SwipeButton
        label={`${loan.item}, prêté à ${loan.person}, ${since}, toucher pour modifier ou glisser à gauche quand c’est rendu`}
        action={
          <span className="flex items-center gap-1.5 text-[15px] font-semibold">
            <CheckIcon size={18} />
            Rendu
          </span>
        }
        onTap={onEdit}
        onSwipe={onReturn}
        className="w-full rounded-card py-3 pr-4 pl-3 text-left"
        contentClassName="flex min-w-0 flex-1 items-center gap-3"
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white/8 text-[17px] font-semibold uppercase">
          {loan.person.charAt(0)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[17px] font-semibold">{loan.item}</span>
          <span className="flex items-center gap-1.5 text-[15px] text-text-2">
            <span
              className="size-1.5 shrink-0 rounded-full"
              style={{ background: lender?.chartColor ?? 'var(--text-2)' }}
            />
            <span className="truncate">à {loan.person}</span>
          </span>
        </span>
        <span className="shrink-0 text-right">
          <span className="block text-[15px] tabular-nums">{formatShortDate(loan.date)}</span>
          <span className={`block text-[13px] ${days >= LONG_LOAN ? 'text-accent' : 'text-text-2'}`}>{since}</span>
        </span>
      </SwipeButton>
    </motion.li>
  )
}
