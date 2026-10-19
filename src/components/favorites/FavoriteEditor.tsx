import { useState } from 'react'
import type { Analysis } from '../../lib/analysis'
import {
  combineItems,
  deleteFavorite,
  newFavoriteId,
  saveFavorite,
  type Favorite,
  type FavoriteInput,
} from '../../lib/favorites'
import { formatInt } from '../../lib/format'
import { mealTotals } from '../../lib/nutrition'
import { useAppStore } from '../../store/appStore'
import { ConfirmDialog } from '../ConfirmDialog'
import { Field, FIELD_INPUT } from '../Field'
import { Stepper } from '../Stepper'
import { DecimalField } from './DecimalField'
import { FoodAiHelper } from './FoodAiHelper'

type Per100 = 'kcal100' | 'carbs100' | 'fat100' | 'protein100'

interface Draft extends Record<Per100, string> {
  name: string
  grams: number
}

const FIELDS: { key: Per100; label: string; unit: string; max: number }[] = [
  { key: 'kcal100', label: 'Calories', unit: 'kcal', max: 900 },
  { key: 'carbs100', label: 'Glucides', unit: 'g', max: 100 },
  { key: 'fat100', label: 'Lipides', unit: 'g', max: 100 },
  { key: 'protein100', label: 'Protéines', unit: 'g', max: 100 },
]

const text = (value: number) => String(value).replace('.', ',')

function initial(favorite: Favorite | null): Draft {
  if (!favorite) return { name: '', grams: 100, kcal100: '', carbs100: '', fat100: '', protein100: '' }
  return {
    name: favorite.name,
    grams: favorite.grams,
    kcal100: text(favorite.kcal100),
    carbs100: text(favorite.carbs100),
    fat100: text(favorite.fat100),
    protein100: text(favorite.protein100),
  }
}

function parseDraft(draft: Draft): FavoriteInput | null {
  const values = FIELDS.map(({ key, max }) => {
    const value = Number(draft[key].replace(',', '.'))
    return draft[key] !== '' && Number.isFinite(value) && value <= max ? value : null
  })
  const [kcal100, carbs100, fat100, protein100] = values
  if (!draft.name.trim() || kcal100 == null || carbs100 == null || fat100 == null || protein100 == null) return null
  return { name: draft.name.trim(), grams: draft.grams, kcal100, carbs100, fat100, protein100 }
}

interface Props {
  uid: string
  favorite: Favorite | null
  onDone: (created?: { id: string; grams: number }) => void
}

export function FavoriteEditor({ uid, favorite, onDone }: Props) {
  const [draft, setDraft] = useState(() => initial(favorite))
  const [confirming, setConfirming] = useState(false)
  const input = parseDraft(draft)
  const totals = input ? mealTotals([{ ...input, confidence: 'haute' }]) : null
  const fail = () => useAppStore.getState().showToast('Enregistrement impossible')

  const applyAi = ({ items, title }: Analysis) => {
    const combined = combineItems(items)
    if (!combined) return
    setDraft((current) => ({
      name: current.name.trim() || title || (items.length === 1 ? (items[0]?.name ?? '') : ''),
      grams: combined.grams,
      kcal100: text(combined.kcal100),
      carbs100: text(combined.carbs100),
      fat100: text(combined.fat100),
      protein100: text(combined.protein100),
    }))
  }

  const save = () => {
    if (!input) return
    const id = favorite?.id ?? newFavoriteId(uid)
    saveFavorite(uid, id, input).catch(fail)
    onDone(favorite ? undefined : { id, grams: input.grams })
  }

  const remove = () => {
    if (favorite) deleteFavorite(uid, favorite.id).catch(fail)
    onDone()
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="-mx-5 flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 pb-4">
        <Field label="Nom">
          <input
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value.slice(0, 60) })}
            placeholder="ex. Mon bol de muesli"
            enterKeyHint="done"
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            className={FIELD_INPUT}
          />
        </Field>
        <FoodAiHelper onResult={applyAi} />
        <div className="flex items-center justify-between rounded-card border border-line bg-surface-2 py-2 pr-2 pl-4">
          <span className="text-[15px] text-text-2">Portion habituelle</span>
          <Stepper
            label="Portion habituelle en grammes"
            value={draft.grams}
            onChange={(grams) => setDraft({ ...draft, grams })}
            step={5}
            min={1}
            max={5000}
          />
        </div>
        <div>
          <p className="label px-1">Valeurs pour 100 g</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {FIELDS.map(({ key, label, unit }) => (
              <DecimalField
                key={key}
                label={label}
                unit={unit}
                value={draft[key]}
                onChange={(value) => setDraft({ ...draft, [key]: value })}
              />
            ))}
          </div>
          <p className="mt-3 px-1 text-[14px] text-text-2 tabular-nums">
            {totals ? (
              <>
                Portion de {formatInt(draft.grams)} g : <span className="text-accent">{formatInt(totals.kcal)} kcal</span> · G{' '}
                {formatInt(totals.carbs)} · L {formatInt(totals.fat)} · P {formatInt(totals.protein)}
              </>
            ) : (
              'Remplis le nom et les quatre valeurs pour enregistrer.'
            )}
          </p>
        </div>
      </div>
      <div className={`grid shrink-0 gap-2.5 pt-3 ${favorite ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {favorite && (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="press h-14 rounded-full bg-white/8 text-[15px] font-medium text-accent"
          >
            Supprimer
          </button>
        )}
        <button
          type="button"
          disabled={!input}
          onClick={save}
          className="press h-14 rounded-full bg-accent text-[16px] font-semibold text-black shadow-accent disabled:opacity-35 disabled:shadow-none"
        >
          Enregistrer
        </button>
      </div>
      <ConfirmDialog
        open={confirming}
        title="Supprimer ce favori ?"
        message={`« ${favorite?.name ?? ''} » ne sera plus proposé.`}
        confirmLabel="Supprimer"
        cancelLabel="Garder"
        onCancel={() => setConfirming(false)}
        onConfirm={remove}
      />
    </div>
  )
}
