import { useEffect, useRef, useState } from 'react'
import { useRecipes } from '../../hooks/useRecipes'
import type { Profile } from '../../lib/profiles'
import type { Ingredient } from '../../lib/recipes'
import { useAppStore } from '../../store/appStore'
import { BottomSheet } from '../BottomSheet'
import { ConfirmDialog } from '../ConfirmDialog'
import { PencilIcon } from '../icons/PencilIcon'
import { ShareIcon } from '../icons/ShareIcon'
import { RecipeEditor } from './RecipeEditor'
import { RecipeImport } from './RecipeImport'
import { RecipeList } from './RecipeList'
import { RecipeView } from './RecipeView'
import { SharePanel } from './SharePanel'
import { ShoppingPicker } from './ShoppingPicker'

interface Props {
  me: Profile
  partner: Profile | null
}

type View =
  | { kind: 'list' }
  | { kind: 'recipe'; id: string }
  | { kind: 'edit'; id: string | null; photos?: string[] }
  | { kind: 'import'; code: string }

const HEADER_BUTTON = 'grid size-10 place-items-center rounded-full text-text-2 active:bg-white/8'

export function RecipesSheet({ me, partner }: Props) {
  const householdId = me.householdId ?? ''
  const open = useAppStore((s) => s.overlay === 'recipes')
  const setOverlay = useAppStore((s) => s.setOverlay)
  const linkCode = useAppStore((s) => s.recipeCode)
  const { recipes, loaded } = useRecipes(householdId)
  const [view, setView] = useState<View>({ kind: 'list' })
  const [dirty, setDirty] = useState(false)
  const [leaving, setLeaving] = useState<(() => void) | null>(null)
  const [shopping, setShopping] = useState<Ingredient[] | null>(null)
  const [sharing, setSharing] = useState(false)
  const seen = useRef(new Set<string>())
  const current = view.kind === 'recipe' || view.kind === 'edit' ? recipes.find((r) => r.id === view.id) : undefined
  if (current) seen.current.add(current.id)

  useEffect(() => {
    if (!linkCode) return
    useAppStore.setState({ recipeCode: null })
    setView({ kind: 'import', code: linkCode })
    setOverlay('recipes')
  }, [linkCode, setOverlay])

  const go = (next: View) => {
    setDirty(false)
    setView(next)
  }
  const guard = (action: () => void) => (view.kind === 'edit' && dirty ? setLeaving(() => action) : action())
  const close = () =>
    guard(() => {
      setOverlay(null)
      go({ kind: 'list' })
    })
  const back = {
    list: undefined,
    recipe: () => go({ kind: 'list' }),
    edit: () => guard(() => go(view.kind === 'edit' && view.id ? { kind: 'recipe', id: view.id } : { kind: 'list' })),
    import: () => go({ kind: 'list' }),
  }[view.kind]
  const title = {
    list: 'Recettes',
    recipe: 'Recette',
    edit: view.kind === 'edit' && view.id ? 'Modifier la recette' : 'Nouvelle recette',
    import: 'Code reçu',
  }[view.kind]

  const importButton = view.kind === 'list' && (
    <button
      type="button"
      onClick={() => go({ kind: 'import', code: '' })}
      className="press h-9 rounded-full bg-white/8 px-3.5 text-[14px] font-medium whitespace-nowrap text-accent"
    >
      Code reçu
    </button>
  )
  const actions = view.kind === 'recipe' && current && (
    <>
      <button
        type="button"
        aria-label="Partager hors du foyer"
        onClick={() => setSharing(true)}
        className={HEADER_BUTTON}
      >
        <ShareIcon />
      </button>
      <button
        type="button"
        aria-label="Modifier la recette"
        onClick={() => go({ kind: 'edit', id: current.id })}
        className={HEADER_BUTTON}
      >
        <PencilIcon />
      </button>
    </>
  )

  return (
    <>
      <BottomSheet open={open} title={title} onClose={close} onBack={back} action={importButton || actions}>
        {view.kind === 'list' && (
          <RecipeList
            recipes={recipes}
            loaded={loaded}
            partner={partner?.name ?? null}
            onOpen={(id) => go({ kind: 'recipe', id })}
            onNew={() => go({ kind: 'edit', id: null })}
            onPhoto={(src) => go({ kind: 'edit', id: null, photos: [src] })}
          />
        )}
        {view.kind === 'recipe' &&
          (current ? (
            <RecipeView
              recipe={current}
              uid={me.uid}
              onEdit={() => go({ kind: 'edit', id: current.id })}
              onShopping={() => setShopping(current.ingredients)}
            />
          ) : (
            <div className="flex justify-center pt-12">
              {seen.current.has(view.id) ? (
                <p className="text-[15px] text-text-2">Cette recette a été supprimée.</p>
              ) : (
                <span className="size-8 animate-spin rounded-full border-[3px] border-white/15 border-t-accent" />
              )}
            </div>
          ))}
        {view.kind === 'edit' && (!view.id || current) && (
          <RecipeEditor
            key={view.id ?? 'new'}
            recipe={current ?? null}
            photos={view.photos}
            householdId={householdId}
            uid={me.uid}
            onDirty={() => setDirty(true)}
            onSaved={(id) => go({ kind: 'recipe', id })}
            onDeleted={() => go({ kind: 'list' })}
          />
        )}
        {view.kind === 'import' && (
          <RecipeImport
            initialCode={view.code}
            householdId={householdId}
            uid={me.uid}
            shared={partner !== null}
            onImported={(id) => go({ kind: 'recipe', id })}
          />
        )}
      </BottomSheet>
      <ShoppingPicker ingredients={shopping} uid={me.uid} onClose={() => setShopping(null)} />
      <SharePanel recipe={sharing ? (current ?? null) : null} me={me} onClose={() => setSharing(false)} />
      <ConfirmDialog
        open={leaving !== null}
        title="Abandonner les modifications ?"
        message="Ce que tu as saisi dans la recette sera perdu."
        confirmLabel="Abandonner"
        cancelLabel="Continuer"
        onCancel={() => setLeaving(null)}
        onConfirm={() => {
          leaving?.()
          setLeaving(null)
        }}
      />
    </>
  )
}
