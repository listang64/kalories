import { useRef, useState, type ChangeEvent } from 'react'
import { geminiErrorMessage } from '../../lib/gemini'
import { fileToJpeg } from '../../lib/image'
import { useLocalSettings } from '../../lib/localSettings'
import { readRecipe, youtubeLink, type ReadRecipe } from '../../lib/recipeReader'
import { LoadingDots } from '../LoadingDots'
import { CameraIcon } from '../icons/CameraIcon'
import { CloseIcon } from '../icons/CloseIcon'
import { SparkIcon } from '../icons/SparkIcon'

const MAX_PHOTOS = 3
interface Props {
  onRead: (read: ReadRecipe) => void
}

export function RecipeReader({ onRead }: Props) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [link, setLink] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const watching = youtubeLink(link) !== null

  const pick = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).slice(0, MAX_PHOTOS - photos.length)
    event.target.value = ''
    const added = await Promise.all(files.map((file) => fileToJpeg(file).catch(() => null)))
    setPhotos((current) => [...current, ...added.filter((src): src is string => src !== null)].slice(0, MAX_PHOTOS))
  }

  const paste = async () => {
    const pasted = await navigator.clipboard?.readText().catch(() => '')
    if (pasted) setLink(pasted.trim())
  }

  const run = async () => {
    const { geminiKey, geminiModel } = useLocalSettings.getState()
    setBusy(true)
    setError('')
    try {
      const read = await readRecipe({ text, photos, link }, geminiKey, geminiModel)
      if (!read) return setError('Aucune recette reconnue : ajoute du texte, une photo plus nette ou une autre vidéo.')
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
        className="press flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-accent/30 bg-accent/8 text-[15px] font-semibold text-accent"
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
        Colle le lien d’une vidéo YouTube, une recette écrite, une photo de livre… ou juste le nom d’un plat.
      </p>
      <textarea
        aria-label="Recette à lire par l’IA"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="ex. lasagnes pour 6, ou colle ici le texte d’une recette"
        rows={3}
        className="mt-3 w-full resize-none rounded-card border border-line bg-black/30 p-3.5 text-base leading-snug outline-none placeholder:text-text-2 focus:border-white/20"
      />
      <div className="mt-2 flex items-center gap-2 rounded-card border border-line bg-black/30 py-1.5 pr-1.5 pl-3.5">
        <input
          aria-label="Lien d’une vidéo YouTube"
          type="url"
          inputMode="url"
          value={link}
          onChange={(e) => setLink(e.target.value.trim())}
          placeholder="Lien d’une vidéo YouTube"
          className="min-w-0 flex-1 bg-transparent py-1.5 text-base outline-none placeholder:text-text-2"
        />
        {link ? (
          <button type="button" aria-label="Effacer le lien" onClick={() => setLink('')} className="grid size-9 shrink-0 place-items-center rounded-full bg-white/8">
            <CloseIcon size={16} />
          </button>
        ) : (
          'clipboard' in navigator && (
            <button type="button" onClick={() => void paste()} className="h-9 shrink-0 rounded-full bg-white/8 px-3 text-[14px] font-medium">
              Coller
            </button>
          )
        )}
      </div>
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
      <div className="mt-3 flex gap-2">
        {!busy && (
          <button
            type="button"
            disabled={photos.length >= MAX_PHOTOS}
            onClick={() => fileRef.current?.click()}
            className="press flex h-11 shrink-0 items-center gap-2 rounded-full bg-white/8 px-4 text-[15px] font-medium disabled:opacity-40"
          >
            <CameraIcon size={18} />
            Photo
          </button>
        )}
        <button
          type="button"
          disabled={busy || (!text.trim() && photos.length === 0 && !link)}
          aria-busy={busy}
          onClick={() => void run()}
          className={`press flex h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-accent text-[15px] font-semibold text-black ${busy ? '' : 'disabled:opacity-40'}`}
        >
          {busy ? (
            <>
              {watching ? 'L’IA regarde la vidéo' : 'Veuillez patienter'}
              <LoadingDots />
            </>
          ) : (
            'Remplir la recette'
          )}
        </button>
      </div>
      <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => void pick(e)} />
    </section>
  )
}
