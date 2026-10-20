import { useState } from 'react'
import { MEAL_TYPES, probableMealType, type MealType } from '../../config/meals'
import { useToday } from '../../hooks/useToday'
import { formatInt } from '../../lib/format'
import { saveMeal } from '../../lib/meals'
import { mealTotals, parseItem } from '../../lib/nutrition'
import type { Nutrition, Recipe } from '../../lib/recipes'
import { useAppStore } from '../../store/appStore'
import { BottomPanel } from '../BottomPanel'
import { Segmented } from '../Segmented'
import { Stepper } from '../Stepper'

const BASE_GRAMS = 50

interface Props {
  recipe: Recipe | null
  uid: string
  onClose: () => void
}

export function AddToDayPanel({ recipe, uid, onClose }: Props) {
  return (
    <BottomPanel open={recipe !== null} label="Ajouter à ma journée" onClose={onClose}>
      {recipe?.nutrition && (
        <AddForm key={recipe.id} recipe={recipe} nutrition={recipe.nutrition} uid={uid} onClose={onClose} />
      )}
    </BottomPanel>
  )
}

interface FormProps {
  recipe: Recipe
  nutrition: Nutrition
  uid: string
  onClose: () => void
}

function AddForm({ recipe, nutrition, uid, onClose }: FormProps) {
  const today = useToday()
  const [type, setType] = useState<MealType>(() => probableMealType())
  const [grams, setGrams] = useState(BASE_GRAMS)
  const portion = recipe.servings ? Math.round(nutrition.grams / recipe.servings) : null
  const { grams: _, ...per100 } = nutrition
  const item = parseItem({ name: recipe.name, grams, ...per100, confidence: 'haute' })
  const totals = item ? mealTotals([item]) : null
  const presets = [BASE_GRAMS, ...(portion && portion !== BASE_GRAMS ? [portion] : [])]

  const add = () => {
    if (!item || !totals) return
    const { showToast } = useAppStore.getState()
    saveMeal(uid, { type, note: '', items: [item] }, today).catch(() => showToast('Enregistrement impossible'))
    showToast(`Ajouté à ta journée · ${formatInt(totals.kcal)} kcal`)
    onClose()
  }

  return (
    <div className="mt-4 flex flex-col gap-4">
      <div>
        <h3 className="text-[17px] font-semibold">Ajouter à ma journée</h3>
        <p className="truncate text-[15px] text-text-2">{recipe.name}</p>
      </div>
      <Segmented label="Repas" value={type} options={MEAL_TYPES} onChange={setType} />
      <div className="flex items-center justify-between rounded-card border border-line bg-black/20 py-2 pr-2 pl-4">
        <span className="text-[15px] text-text-2">Quantité</span>
        <Stepper label="Quantité mangée en grammes" value={grams} onChange={setGrams} step={5} min={5} max={3000} />
      </div>
      {presets.length > 1 && (
        <div className="flex gap-2">
          {presets.map((preset, index) => (
            <button
              key={preset}
              type="button"
              aria-pressed={grams === preset}
              onClick={() => setGrams(preset)}
              className={`press h-9 rounded-full border px-3.5 text-[14px] tabular-nums ${
                grams === preset ? 'border-accent bg-accent/12 text-text' : 'border-line text-text-2'
              }`}
            >
              {index === 0 ? `${preset} g` : `Une part · ${formatInt(preset)} g`}
            </button>
          ))}
        </div>
      )}
      {totals && (
        <p className="text-center text-[15px] text-text-2 tabular-nums">
          <span className="text-[28px] font-semibold text-accent">{formatInt(totals.kcal)}</span> kcal · G{' '}
          {formatInt(totals.carbs)} · L {formatInt(totals.fat)} · P {formatInt(totals.protein)}
        </p>
      )}
      <button
        type="button"
        disabled={!item}
        onClick={add}
        className="press h-13 w-full rounded-full bg-accent text-[16px] font-semibold text-black shadow-accent disabled:opacity-35"
      >
        Ajouter à ma journée
      </button>
    </div>
  )
}
