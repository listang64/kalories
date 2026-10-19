import { useEffect, useState } from 'react'
import type { Profile } from '../../lib/profiles'
import { recipeFileName, recipePdf } from '../../lib/recipePdf'
import { createRecipeShare, SHARE_DAYS, shareRecipeCode } from '../../lib/recipeShares'
import type { Recipe } from '../../lib/recipes'
import { shareFile } from '../../lib/share'
import { useAppStore } from '../../store/appStore'
import { usePerson } from '../../store/sessionStore'
import { BottomPanel } from '../BottomPanel'
import { DocumentIcon } from '../icons/DocumentIcon'

interface Props {
  recipe: Recipe | null
  me: Profile
  onClose: () => void
}

export function SharePanel({ recipe, me, onClose }: Props) {
  return (
    <BottomPanel open={recipe !== null} label="Partager la recette" onClose={onClose}>
      {recipe && (
        <div className="mt-4 flex flex-col items-center gap-2 text-center">
          <h3 className="text-[17px] font-semibold">Partager « {recipe.name} »</h3>
          <PdfButton recipe={recipe} me={me} />
          <p className="label mt-4">Ou pour quelqu’un qui a Kalories</p>
          <ShareCode key={recipe.id} recipe={recipe} me={me} />
        </div>
      )}
    </BottomPanel>
  )
}

function PdfButton({ recipe, me }: { recipe: Recipe; me: Profile }) {
  const author = usePerson(recipe.createdBy)
  const showToast = useAppStore((s) => s.showToast)

  const send = async () => {
    const file = new File([recipePdf(recipe, author?.name ?? me.name)], recipeFileName(recipe.name), {
      type: 'application/pdf',
    })
    if ((await shareFile(file).catch(() => null)) === 'downloaded') showToast('PDF téléchargé')
  }

  return (
    <>
      <button
        type="button"
        onClick={() => void send()}
        className="press mt-2 flex h-13 w-full items-center justify-center gap-2 rounded-full bg-white/8 text-[16px] font-semibold text-accent"
      >
        <DocumentIcon />
        Partager en PDF
      </button>
      <p className="text-[13px] text-text-2">À envoyer à n’importe qui ou à imprimer.</p>
    </>
  )
}

type State = { kind: 'busy' } | { kind: 'ready'; code: string } | { kind: 'error' }

function ShareCode({ recipe, me }: { recipe: Recipe; me: Profile }) {
  const [source] = useState({ recipe, me })
  const [state, setState] = useState<State>({ kind: 'busy' })
  const [attempt, setAttempt] = useState(0)
  const showToast = useAppStore((s) => s.showToast)

  useEffect(() => {
    let live = true
    createRecipeShare(source.recipe, source.me)
      .then((code) => live && setState({ kind: 'ready', code }))
      .catch(() => live && setState({ kind: 'error' }))
    return () => {
      live = false
    }
  }, [source, attempt])

  const send = async (code: string) => {
    if ((await shareRecipeCode(recipe.name, code).catch(() => null)) === 'copied') showToast('Lien copié')
  }

  return (
    <>
      <p className="max-w-80 text-[14px] leading-snug text-text-2">
        Hors de ton foyer : il ouvre le lien, ou entre le code dans Recettes → Code reçu.
      </p>
      {state.kind === 'busy' && (
        <span className="my-6 size-9 animate-spin rounded-full border-[3px] border-white/15 border-t-accent" />
      )}
      {state.kind === 'error' && (
        <>
          <p className="my-4 text-[15px] text-accent">Partage impossible pour l’instant (connexion ?)</p>
          <button
            type="button"
            onClick={() => {
              setState({ kind: 'busy' })
              setAttempt((n) => n + 1)
            }}
            className="press h-12 w-full rounded-full bg-white/8 text-[15px] font-semibold text-accent"
          >
            Réessayer
          </button>
        </>
      )}
      {state.kind === 'ready' && (
        <>
          <p className="my-2 font-mono text-[34px] font-semibold tracking-[0.2em] text-accent select-all">{state.code}</p>
          <p className="text-[13px] text-text-2">Valable {SHARE_DAYS} jours.</p>
          <button
            type="button"
            onClick={() => void send(state.code)}
            className="press mt-3 h-13 w-full rounded-full bg-accent text-[16px] font-semibold text-black shadow-accent"
          >
            Envoyer le lien
          </button>
        </>
      )}
    </>
  )
}
