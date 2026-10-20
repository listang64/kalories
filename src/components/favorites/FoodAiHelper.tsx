import { useState } from 'react'
import { describeFood, type Analysis } from '../../lib/analysis'
import { formatInt } from '../../lib/format'
import { geminiErrorMessage } from '../../lib/gemini'
import { useLocalSettings } from '../../lib/localSettings'
import { itemTotals, type MealItem } from '../../lib/nutrition'
import { LoadingDots } from '../LoadingDots'

export function FoodAiHelper({ onResult }: { onResult: (result: Analysis) => void }) {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [items, setItems] = useState<MealItem[]>([])

  const run = async () => {
    if (!text.trim() || busy) return
    const { geminiKey, geminiModel } = useLocalSettings.getState()
    setBusy(true)
    setError('')
    try {
      const result = await describeFood(text, geminiKey, geminiModel)
      setItems(result.items)
      if (result.items.length === 0) return setError(result.comment || 'Gemini n’a reconnu aucun aliment')
      onResult(result)
    } catch (err) {
      setError(geminiErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="rounded-card border border-line bg-surface-2 p-4">
      <h3 className="label text-accent">Aide de l’IA</h3>
      <p className="mt-1 text-[14px] leading-snug text-text-2">
        Décris l’aliment ou la recette avec les poids, l’app calcule les valeurs pour 100 g.
      </p>
      <textarea
        aria-label="Description pour l’IA"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="ex. 60 g de flocons d’avoine, 200 ml de lait demi-écrémé, 1 banane"
        rows={3}
        className="mt-3 w-full resize-none rounded-card border border-line bg-black/30 p-3.5 text-base leading-snug outline-none placeholder:text-text-2 focus:border-white/20"
      />
      {error && <p className="mt-2 text-[14px] text-accent">{error}</p>}
      <button
        type="button"
        onClick={() => void run()}
        disabled={!text.trim() || busy}
        aria-busy={busy}
        className={`press mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-white/8 text-[15px] font-semibold text-accent ${busy ? '' : 'disabled:opacity-40'}`}
      >
        {busy ? (
          <>
            Veuillez patienter
            <LoadingDots />
          </>
        ) : (
          'Calculer avec l’IA'
        )}
      </button>
      {items.length > 0 && (
        <ul className="mt-3 space-y-1.5 text-[14px] tabular-nums">
          {items.map((item, index) => (
            <li key={index} className="flex gap-3">
              <span className="min-w-0 flex-1 truncate">{item.name}</span>
              <span className="shrink-0 text-text-2">{formatInt(item.grams)} g</span>
              <span className="min-w-[68px] shrink-0 text-right whitespace-nowrap">{formatInt(itemTotals(item).kcal)} kcal</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
