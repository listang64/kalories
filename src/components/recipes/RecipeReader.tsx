import { useRef, useState, type ChangeEvent } from 'react'
import { geminiErrorMessage } from '../../lib/gemini'
import { fileToJpeg } from '../../lib/image'
import { useLocalSettings } from '../../lib/localSettings'
import { readRecipe, type ReadRecipe } from '../../lib/recipeReader'
import { CameraIcon } from '../icons/CameraIcon'
import { CloseIcon } from '../icons/CloseIcon'
import { SparkIcon } from '../icons/SparkIcon'

const MAX_PHOTOS = 3

interface Props {
  startOpen: boolean
  onRead: (read: ReadRecipe) => void
}

export function RecipeReader({ startOpen, onRead }: Props) {
  const [open, setOpen] = useState(startOpen)
  const [text, setText] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const pick = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).slice(0, MAX_PHOTOS - photos.length)
    event.target.value = ''
    const added = await Promise.all(files.map((file) => fileToJpeg(file).catch(() => null)))
    setPhotos((current) => [...current, ...added.filter((src): src is string => src !== null)].slice(0, MAX_PHOTOS))
  }

  const run = async () => {
    const { geminiKey, geminiModel } = useLocalSettings.getState()
    setBusy(true)
    setError('')
    try {
      const read = await readRecipe(text, photos, geminiKey, geminiModel)
      if (!read) return setError('Aucune recette reconnue : ajoute du texte ou une photo plus nette.')
      onRead(read)
      setOpen(false)
    } catch (err) {
      setError(geminiErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="press flex h-12 items-center justify-center gap-2 rounded-full border border-accent/30 bg-accent/8 text-[15px] font-semibold text-accent"
      >
        <SparkIcon />
        Remplir avec l’IA
      </button>
    )
  }

  return (
    <section className="rounded-card border border-accent/30 bg-accent/8 p-4">
      <h4 className="label flex items-center gap-1.5 text-accent">
        <SparkIcon size={15} />
        Remplir avec l’IA
      </h4>
      <p className="mt-1 text-[14px] leading-snug text-text-2">
        Colle ou dicte une recette, prends en photo une page de livre… ou écris juste le nom d’un plat.
      </p>
      <textarea
        aria-label="Recette à lire par l’IA"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="ex. lasagnes pour 6, ou colle ici le texte d’une recette"
        rows={3}
        className="mt-3 w-full resize-none rounded-card border border-line bg-black/30 p-3.5 text-base leading-snug outline-none placeholder:text-text-2 focus:border-white/20"
      />
      {photos.length > 0 && (
        <div className="mt-2 flex gap-2">
          {photos.map((src, index) => (
            <span key={index} className="relative">
              <img src={src} alt={`Photo ${index + 1}`} className="size-16 rounded-xl object-cover" />
              {busy && (
                <span className="absolute inset-0 grid place-items-center rounded-xl bg-black/50">
                  <span className="size-6 animate-spin rounded-full border-[2.5px] border-white/25 border-t-accent" />
                </span>
              )}
              <button
                type="button"
                aria-label={`Retirer la photo ${index + 1}`}
                onClick={() => setPhotos((current) => current.filter((_, i) => i !== index))}
                className="absolute -top-1.5 -right-1.5 grid size-6 place-items-center rounded-full bg-black/80 text-text"
              >
                <CloseIcon size={14} />
              </button>
            </span>
          ))}
        </div>
      )}
      {error && <p className="mt-2 text-[14px] text-accent">{error}</p>}
      <div className="mt-3 grid grid-cols-[auto_1fr] gap-2">
        <button
          type="button"
          disabled={photos.length >= MAX_PHOTOS}
          onClick={() => fileRef.current?.click()}
          className="press flex h-11 items-center gap-2 rounded-full bg-white/8 px-4 text-[15px] font-medium disabled:opacity-40"
        >
          <CameraIcon size={18} />
          Photo
        </button>
        <button
          type="button"
          disabled={busy || (!text.trim() && photos.length === 0)}
          onClick={() => void run()}
          className="press h-11 rounded-full bg-accent text-[15px] font-semibold text-black disabled:opacity-40"
        >
          {busy ? 'Lecture en cours…' : 'Remplir la recette'}
        </button>
      </div>
      <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => void pick(e)} />
    </section>
  )
}
