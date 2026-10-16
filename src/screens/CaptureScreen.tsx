import { CameraView } from '../components/capture/CameraView'
import { PhotoStrip } from '../components/capture/PhotoStrip'
import { fileToJpeg } from '../lib/image'
import { useAppStore } from '../store/appStore'

export function CaptureScreen() {
  const draft = useAppStore((s) => s.draft)
  const active = useAppStore((s) => s.overlay === 'add' && s.addStep === 'capture')
  const setNote = useAppStore((s) => s.setNote)
  const addPhoto = useAppStore((s) => s.addPhoto)
  const removePhoto = useAppStore((s) => s.removePhoto)
  const showToast = useAppStore((s) => s.showToast)
  const canAnalyze = draft.note.trim() !== '' || draft.photos.length > 0

  const add = (src: string) => {
    if (!addPhoto(src)) showToast('6 photos maximum')
  }

  const importFiles = async (files: File[]) => {
    for (const file of files) {
      try {
        add(await fileToJpeg(file))
      } catch {
        showToast('Photo illisible')
      }
    }
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <textarea
        aria-label="Qu’as-tu mangé ?"
        value={draft.note}
        onChange={(e) => setNote(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            e.currentTarget.blur()
          }
        }}
        placeholder="Qu’as-tu mangé ? (ex. 2 tranches de pain complet, 1 œuf, café sucré)"
        enterKeyHint="done"
        className="h-[24%] min-h-24 shrink-0 resize-none rounded-card border border-line bg-surface-2 p-4 text-[17px] leading-snug outline-none placeholder:text-text-2 focus:border-white/20"
      />
      <CameraView active={active} onPhoto={add} onFiles={(files) => void importFiles(files)} />
      {draft.photos.length > 0 && <PhotoStrip photos={draft.photos} onRemove={removePhoto} />}
      <button
        type="button"
        disabled={!canAnalyze}
        onClick={() => showToast('L’analyse Gemini arrive à l’étape 7')}
        className="h-14 shrink-0 rounded-full bg-accent text-[17px] font-semibold text-black shadow-accent transition-opacity disabled:opacity-35 disabled:shadow-none"
      >
        Analyser
      </button>
    </div>
  )
}
