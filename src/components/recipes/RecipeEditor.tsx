import { useState, type ReactNode } from 'react'
import { RECIPE_CATEGORIES } from '../../config/recipes'
import { fromDraft, toDraft, withContent, type RecipeDraft } from '../../lib/recipeDraft'
import { createRecipe, deleteRecipe, newRecipeId, RECIPE_LIMITS, updateRecipe, type Recipe } from '../../lib/recipes'
import { sharedErrorMessage } from '../../lib/shared'
import { useAppStore } from '../../store/appStore'
import { ConfirmDialog } from '../ConfirmDialog'
import { Field, FIELD_INPUT } from '../Field'
import { Segmented } from '../Segmented'
import { SparkIcon } from '../icons/SparkIcon'
import { ValueField } from '../ValueField'
import { IngredientsEditor } from './IngredientsEditor'
import { NutritionEditor } from './NutritionEditor'
import { RecipeReader } from './RecipeReader'
import { StepsEditor } from './StepsEditor'

interface Props {
  recipe: Recipe | null
  householdId: string
  uid: string
  onSaved: (id: string) => void
  onDeleted: () => void
  onDirty: () => void
}

const CATEGORIES = RECIPE_CATEGORIES.map(({ value, label }) => ({ value, label }))

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h4 className="label mb-2 px-1">{title}</h4>
      {children}
    </section>
  )
}

export function RecipeEditor({ recipe, householdId, uid, onSaved, onDeleted, onDirty }: Props) {
  const [draft, setDraft] = useState(() => toDraft(recipe))
  const [confirming, setConfirming] = useState(false)
  const [wroteSteps, setWroteSteps] = useState(false)
  const showToast = useAppStore((s) => s.showToast)
  const fail = (error: unknown) => showToast(sharedErrorMessage(error))

  const change = (next: (current: RecipeDraft) => RecipeDraft) => {
    setDraft(next)
    onDirty()
  }
  const patch = (values: Partial<RecipeDraft>) => change((current) => ({ ...current, ...values }))

  const save = () => {
    const input = fromDraft(draft)
    const id = recipe?.id ?? newRecipeId(householdId)
    const saving = recipe ? updateRecipe(householdId, id, input) : createRecipe(householdId, id, input, uid)
    saving.catch(fail)
    onSaved(id)
  }

  const remove = () => {
    if (recipe) deleteRecipe(householdId, recipe.id).catch(fail)
    setConfirming(false)
    onDeleted()
  }

  return (
    <div className="flex h-full flex-col">
      <div className="-mx-5 flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-5 pb-6">
        <RecipeReader
          onRead={({ recipe: read, wroteSteps: wrote }) => {
            setWroteSteps(wrote)
            change((current) => withContent(current, read))
          }}
        />
        <Field label="Nom de la recette">
          <input
            value={draft.name}
            onChange={(e) => patch({ name: e.target.value.slice(0, RECIPE_LIMITS.name) })}
            placeholder="ex. Lasagnes de Mamie"
            enterKeyHint="done"
            autoCapitalize="sentences"
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            className={FIELD_INPUT}
          />
        </Field>
        <Section title="Catégorie">
          <Segmented
            label="Catégorie"
            value={draft.category}
            options={CATEGORIES}
            onChange={(category) => patch({ category })}
          />
        </Section>
        <div className="grid grid-cols-2 gap-2">
          <ValueField
            label="Préparation"
            unit="min"
            value={draft.prep}
            onChange={(prep) => patch({ prep })}
            decimals={false}
            placeholder="—"
          />
          <ValueField
            label="Personnes"
            unit="pers."
            value={draft.servings}
            onChange={(servings) => patch({ servings })}
            decimals={false}
            digits={2}
            placeholder="—"
          />
        </div>
        <Section title="Ingrédients">
          <IngredientsEditor ingredients={draft.ingredients} onChange={(ingredients) => patch({ ingredients })} />
        </Section>
        <Section title="Préparation détaillée">
          {wroteSteps && (
            <p className="mb-2 flex items-start gap-1.5 px-1 text-[14px] leading-snug text-accent">
              <span className="mt-px shrink-0">
                <SparkIcon size={15} />
              </span>
              La recette ne donnait pas la préparation : l’IA a rédigé les étapes, relis-les.
            </p>
          )}
          <StepsEditor steps={draft.steps} onChange={(steps) => patch({ steps })} />
        </Section>
        <Section title="Cuisson">
          <div className="grid grid-cols-2 gap-2">
            <ValueField
              label="Durée"
              unit="min"
              value={draft.cookMinutes}
              onChange={(cookMinutes) => patch({ cookMinutes })}
              decimals={false}
              placeholder="—"
            />
            <ValueField
              label="Température"
              unit="°C"
              value={draft.cookTemp}
              onChange={(cookTemp) => patch({ cookTemp })}
              decimals={false}
              placeholder="—"
            />
          </div>
          <input
            aria-label="Mode de cuisson"
            value={draft.cookNote}
            onChange={(e) => patch({ cookNote: e.target.value.slice(0, RECIPE_LIMITS.note) })}
            placeholder="Mode : four chaleur tournante, poêle, vapeur…"
            enterKeyHint="done"
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            className={`${FIELD_INPUT} mt-2`}
          />
        </Section>
        <Section title="Valeurs nutritionnelles">
          <NutritionEditor draft={draft} onChange={patch} />
        </Section>
      </div>
      <div className={`grid shrink-0 gap-2.5 pt-3 ${recipe ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {recipe && (
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
          disabled={!draft.name.trim()}
          onClick={save}
          className="press h-14 rounded-full bg-accent text-[16px] font-semibold text-black shadow-accent disabled:opacity-35 disabled:shadow-none"
        >
          Enregistrer
        </button>
      </div>
      <ConfirmDialog
        open={confirming}
        title="Supprimer cette recette ?"
        message="Elle disparaîtra aussi pour tout le foyer."
        confirmLabel="Supprimer"
        cancelLabel="Garder"
        onCancel={() => setConfirming(false)}
        onConfirm={remove}
      />
    </div>
  )
}
