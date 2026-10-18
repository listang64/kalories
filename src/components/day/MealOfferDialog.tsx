import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { mealLabel } from '../../config/meals'
import { useToday } from '../../hooks/useToday'
import { dayLabel } from '../../lib/dates'
import { formatInt } from '../../lib/format'
import { acceptOffer, declineOffer, useMealOffers, type MealOffer } from '../../lib/mealOffers'
import { itemTotals, mealTotals } from '../../lib/nutrition'
import { useAppStore } from '../../store/appStore'
import { usePerson } from '../../store/sessionStore'
import { ProfileOrb } from '../ProfileOrb'

export function MealOfferDialog({ uid }: { uid: string }) {
  const [offer] = useMealOffers(uid)

  return (
    <AnimatePresence>
      {offer && (
        <div className="fixed inset-0 z-50 grid place-items-center px-6">
          <motion.div
            className="absolute inset-0 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <OfferCard key={offer.id} uid={uid} offer={offer} />
        </div>
      )}
    </AnimatePresence>
  )
}

function OfferCard({ uid, offer }: { uid: string; offer: MealOffer }) {
  const [busy, setBusy] = useState(false)
  const today = useToday()
  const sender = usePerson(offer.from)
  const showToast = useAppStore((s) => s.showToast)
  const total = mealTotals(offer.items).kcal

  const answer = async (accept: boolean) => {
    setBusy(true)
    try {
      await (accept ? acceptOffer(uid, offer) : declineOffer(uid, offer))
      if (accept) showToast('Ajouté à ta journée')
    } catch {
      showToast('Action impossible pour l’instant')
      setBusy(false)
    }
  }

  return (
    <motion.div
      role="alertdialog"
      aria-modal="true"
      aria-label={`${offer.fromName} partage un repas`}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 34 }}
      className="relative w-full max-w-sm rounded-sheet border border-line bg-surface-2 p-5"
    >
      <div className="flex items-center gap-3">
        {sender && <ProfileOrb profile={sender} size={36} />}
        <div className="min-w-0">
          <h3 className="text-[17px] leading-snug font-semibold">{offer.fromName} partage son repas</h3>
          <p className="text-[13px] text-text-2">
            {mealLabel(offer.type)} · {dayLabel(offer.date, today)}
          </p>
        </div>
      </div>
      <ul className="mt-4 max-h-[40dvh] divide-y divide-line overflow-y-auto rounded-card border border-line bg-black/30">
        {offer.items.map((item, i) => (
          <li key={i} className="flex items-baseline gap-2 px-3.5 py-2.5 text-[15px] tabular-nums">
            <span className="min-w-0 flex-1 truncate">{item.name}</span>
            <span className="shrink-0 text-text-2">{formatInt(item.grams)} g</span>
            <span className="w-16 shrink-0 text-right font-semibold">{formatInt(itemTotals(item).kcal)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-center text-[15px] text-text-2">
        <span className="text-[22px] font-semibold text-text tabular-nums">{formatInt(total)}</span> kcal au total
      </p>
      <div className="mt-4 grid grid-cols-[auto_1fr] gap-2.5">
        <button
          type="button"
          disabled={busy}
          onClick={() => void answer(false)}
          className="h-12 rounded-full bg-white/8 px-5 text-[15px] font-medium disabled:opacity-40"
        >
          Refuser
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void answer(true)}
          className="h-12 rounded-full bg-accent text-[15px] font-semibold text-black disabled:opacity-40"
        >
          Ajouter à ma journée
        </button>
      </div>
    </motion.div>
  )
}
