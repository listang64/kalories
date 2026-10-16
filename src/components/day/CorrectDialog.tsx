import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { correctMeal } from '../../lib/analysis'
import { geminiErrorMessage } from '../../lib/gemini'
import { useLocalSettings } from '../../lib/localSettings'
import type { Meal } from '../../lib/meals'
import type { MealItem } from '../../lib/nutrition'

interface Props {
  meal: Meal | null
  onClose: () => void
  onCorrected: (meal: Meal, items: MealItem[]) => void
}

export function CorrectDialog({ meal, onClose, onCorrected }: Props) {
  return (
    <AnimatePresence>
      {meal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center px-5 pt-[calc(var(--safe-top)+72px)]">
          <motion.div
            className="absolute inset-0 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Corriger avec l’IA"
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 460, damping: 36 }}
            className="relative w-full rounded-sheet border border-line bg-surface-2 p-5"
          >
            <CorrectForm meal={meal} onClose={onClose} onCorrected={onCorrected} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

function CorrectForm({ meal, onClose, onCorrected }: Props & { meal: Meal }) {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    if (!text.trim() || busy) return
    const { geminiKey, geminiModel } = useLocalSettings.getState()
    setBusy(true)
    setError('')
    try {
      const result = await correctMeal(meal.items, text, geminiKey, geminiModel)
      if (result.items.length === 0) return setError(result.comment || 'Gemini n’a renvoyé aucun aliment')
      onCorrected(meal, result.items)
    } catch (err) {
      setError(geminiErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <h3 className="text-[17px] font-semibold">Corriger avec l’IA</h3>
      <p className="mt-1 text-[15px] text-text-2">Dis ce qui change, Gemini met la liste à jour.</p>
      <textarea
        aria-label="Correction"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="ex. en fait c’était 2 œufs, j’ai mangé la moitié du riz"
        rows={3}
        className="mt-4 w-full resize-none rounded-card border border-line bg-black/30 p-3.5 text-base leading-snug outline-none placeholder:text-text-2 focus:border-white/20"
      />
      {error && <p className="mt-2 text-[15px] text-accent">{error}</p>}
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <button type="button" onClick={onClose} className="h-11 rounded-full bg-white/8 text-[15px] font-medium">
          Annuler
        </button>
        <button
          type="button"
          onClick={() => void submit()}
          disabled={!text.trim() || busy}
          className="h-11 rounded-full bg-accent text-[15px] font-semibold text-black disabled:opacity-40"
        >
          {busy ? 'Correction…' : 'Corriger'}
        </button>
      </div>
    </>
  )
}
