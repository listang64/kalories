import { useEffect, useState, type FormEvent } from 'react'
import { categoryLabel } from '../../config/recipes'
import { formatInt } from '../../lib/format'
import { findRecipeShare, type SharedRecipe } from '../../lib/recipeShares'
import { createRecipe, newRecipeId } from '../../lib/recipes'
import { normalizeCode, sharedErrorMessage } from '../../lib/shared'
import { useAppStore } from '../../store/appStore'
import { FIELD_INPUT } from '../Field'

interface Props {
  initialCode: string
  householdId: string
  uid: string
  shared: boolean
  onImported: (id: string) => void
}

const BUTTON = 'press h-13 w-full rounded-full bg-accent font-semibold text-black shadow-accent disabled:opacity-40'

const ERRORS = {
  unknown: 'Code introuvable : vérifie les 6 caractères',
  expired: 'Ce partage a expiré : demande un nouveau code',
  offline: 'Pas de connexion internet',
}

export function RecipeImport({ initialCode, householdId, uid, shared, onImported }: Props) {
  const [code, setCode] = useState(initialCode)
  const [found, setFound] = useState<SharedRecipe | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const showToast = useAppStore((s) => s.showToast)

  const find = async (value: string) => {
    setBusy(true)
    setError('')
    const result = await findRecipeShare(value)
    setBusy(false)
    if (result.status === 'found') setFound(result.shared)
    else setError(ERRORS[result.status])
  }

  useEffect(() => {
    if (initialCode.length === 6) void find(initialCode)
  }, [initialCode])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    void find(code)
  }

  const add = (current: SharedRecipe) => {
    const id = newRecipeId(householdId)
    createRecipe(householdId, id, current.recipe, uid).catch((err: unknown) => showToast(sharedErrorMessage(err)))
    showToast(shared ? 'Recette ajoutée à vos recettes' : 'Recette ajoutée à tes recettes')
    onImported(id)
  }

  if (found) {
    const { recipe } = found
    return (
      <div className="flex flex-col gap-4 pt-2">
        <div className="rounded-card border border-line bg-surface-2 p-4">
          <p className="label text-accent">{categoryLabel(recipe.category)}</p>
          <p className="mt-1 text-[22px] leading-tight font-semibold">{recipe.name}</p>
          <p className="mt-2 text-[14px] text-text-2 tabular-nums">
            {recipe.ingredients.length} ingrédient{recipe.ingredients.length > 1 ? 's' : ''} · {recipe.steps.length} étape
            {recipe.steps.length > 1 ? 's' : ''}
            {recipe.nutrition && ` · ${formatInt(recipe.nutrition.kcal100)} kcal / 100 g`}
          </p>
          {found.fromName && <p className="mt-3 text-[14px]">Partagée par {found.fromName}</p>}
        </div>
        <button type="button" onClick={() => add(found)} className={BUTTON}>
          {shared ? 'Ajouter à nos recettes' : 'Ajouter à mes recettes'}
        </button>
        <button type="button" onClick={() => setFound(null)} className="h-11 text-[15px] text-text-2">
          Autre code
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 pt-2">
      <p className="text-[15px] text-text-2">Entre le code à 6 caractères reçu avec la recette.</p>
      <input
        aria-label="Code de la recette"
        value={code}
        onChange={(e) => {
          setCode(normalizeCode(e.target.value))
          setError('')
        }}
        placeholder="XXXXXX"
        autoCapitalize="characters"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="search"
        className={`${FIELD_INPUT} h-14 text-center font-mono text-[24px] tracking-[0.3em]`}
      />
      {error && (
        <p role="alert" className="px-1 text-sm text-accent">
          {error}
        </p>
      )}
      <button type="submit" disabled={code.length !== 6 || busy} className={`${BUTTON} mt-1`}>
        {busy ? 'Recherche…' : 'Voir la recette'}
      </button>
    </form>
  )
}
