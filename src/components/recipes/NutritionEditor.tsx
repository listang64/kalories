import { useState } from 'react'
import { analyzeRecipe } from '../../lib/analysis'
import { combineItems } from '../../lib/favorites'
import { formatInt } from '../../lib/format'
import { geminiErrorMessage } from '../../lib/gemini'
import { useLocalSettings } from '../../lib/localSettings'
import { itemTotals, type MealItem } from '../../lib/nutrition'
import {
  draftNutrition,
  ingredientLines,
  parseDecimal,
  PER100_KEYS,
  rescale,
  valuesOf,
  type Per100Key,
  type RecipeDraft,
} from '../../lib/recipeDraft'
import { LoadingDots } from '../LoadingDots'
import { SparkIcon } from '../icons/SparkIcon'
import { ValueField } from '../ValueField'

interface Props {
  draft: RecipeDraft
  onChange: (patch: Partial<RecipeDraft>) => void
}

const LABELS: Record<Per100Key, [string, string]> = {
  kcal100: ['Calories', 'kcal'],
  carbs100: ['Glucides', 'g'],
  fat100: ['Lipides', 'g'],
  protein100: ['Protéines', 'g'],
}

export function NutritionEditor({ draft, onChange }: Props) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [items, setItems] = useState<MealItem[]>([])
  const lines = ingredientLines(draft)
  const nutrition = draftNutrition(draft.weight, draft.values)
  const servings = parseDecimal(draft.servings)

  const calculate = async () => {
    const { geminiKey, geminiModel } = useLocalSettings.getState()
    setBusy(true)
    setError('')
    try {
      const result = await analyzeRecipe(draft.name, lines, geminiKey, geminiModel)
      const combined = combineItems(result.items)
      if (!combined) return setError(result.comment || 'Gemini n’a reconnu aucun ingrédient')
      setItems(result.items)
      onChange({ anchor: combined, weight: String(combined.grams), values: valuesOf(combined) })
    } catch (err) {
      setError(geminiErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const setWeight = (weight: string) => {
    const grams = parseDecimal(weight)
    onChange(draft.anchor && grams ? { weight, values: rescale(draft.anchor, grams) } : { weight })
  }

  const setValue = (key: Per100Key, value: string) => {
    const values = { ...draft.values, [key]: value }
    onChange({ values, anchor: draftNutrition(draft.weight, values) ?? draft.anchor })
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        disabled={busy || lines.length === 0}
        aria-busy={busy}
        onClick={() => void calculate()}
        className={`press flex h-12 items-center justify-center gap-2 rounded-full bg-white/8 text-[15px] font-semibold text-accent ${busy ? '' : 'disabled:opacity-40'}`}
      >
        {busy ? (
          <>
            Veuillez patienter
            <LoadingDots />
          </>
        ) : (
          <>
            <SparkIcon />
            {lines.length === 0 ? 'Ajoute des ingrédients pour calculer' : 'Calculer avec l’IA'}
          </>
        )}
      </button>
      {error && <p className="px-1 text-[14px] text-accent">{error}</p>}
      {items.length > 0 && (
        <ul className="space-y-1.5 rounded-card border border-line bg-surface-2 p-3.5 text-[14px] tabular-nums">
          {items.map((item, index) => (
            <li key={index} className="flex gap-3">
              <span className="min-w-0 flex-1 truncate">{item.name}</span>
              <span className="shrink-0 text-text-2">{formatInt(item.grams)} g</span>
              <span className="min-w-[68px] shrink-0 text-right whitespace-nowrap">{formatInt(itemTotals(item).kcal)} kcal</span>
            </li>
          ))}
        </ul>
      )}
      <ValueField
        label="Poids total du plat"
        unit="g"
        value={draft.weight}
        onChange={setWeight}
        decimals={false}
        digits={5}
        placeholder="—"
      />
      <p className="-mt-1 px-1 text-[13px] leading-snug text-text-2">
        Pèse le plat une fois cuit et corrige ce poids : l’eau évaporée concentre les calories, l’app recalcule les
        valeurs pour 100 g.
      </p>
      <p className="label mt-1 px-1">Pour 100 g</p>
      <div className="grid grid-cols-2 gap-2">
        {PER100_KEYS.map((key) => (
          <ValueField
            key={key}
            label={LABELS[key][0]}
            unit={LABELS[key][1]}
            value={draft.values[key]}
            onChange={(value) => setValue(key, value)}
          />
        ))}
      </div>
      {nutrition && (
        <p className="px-1 text-[14px] text-text-2 tabular-nums">
          {servings ? `Une part (${formatInt(nutrition.grams / servings)} g) : ` : `Le plat entier : `}
          <span className="text-accent">
            {formatInt(((servings ? nutrition.grams / servings : nutrition.grams) * nutrition.kcal100) / 100)} kcal
          </span>
        </p>
      )}
    </div>
  )
}
