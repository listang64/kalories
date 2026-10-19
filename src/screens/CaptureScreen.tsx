import { useState } from 'react'
import { CameraView } from '../components/capture/CameraView'
import { PhotoStrip } from '../components/capture/PhotoStrip'
import { FavoritesSheet } from '../components/favorites/FavoritesSheet'
import { BarcodeScanner } from '../components/scanner/BarcodeScanner'
import { useAnalyzeMeal } from '../hooks/useAnalyzeMeal'
import { fileToJpeg } from '../lib/image'
import type { MealItem } from '../lib/nutrition'
import { useAppStore } from '../store/appStore'

export function CaptureScreen({ uid }: { uid: string }) {
  const draft = useAppStore((s) => s.draft)
  const active = useAppStore((s) => s.overlay === 'add' && s.addStep === 'capture')
  const setNote = useAppStore((s) => s.setNote)
  const addPhoto = useAppStore((s) => s.addPhoto)
  const removePhoto = useAppStore((s) => s.removePhoto)
  const showToast = useAppStore((s) => s.showToast)
  const error = useAppStore((s) => s.analysisError)
  const openSettingsOnTop = useAppStore((s) => s.openSettingsOnTop)
  const analyze = useAnalyzeMeal()
  const [scanning, setScanning] = useState(false)
  const [favorites, setFavorites] = useState(false)
  const canAnalyze = draft.note.trim() !== '' || draft.photos.length > 0

  const add = (src: string) => {
    if (!addPhoto(src)) showToast('6 photos maximum')
  }

  const addItems = (items: MealItem[]) => {
    const { appendItems, setAddStep } = useAppStore.getState()
    appendItems(items)
    setScanning(false)
    setFavorites(false)
    setAddStep('review')
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
      <CameraView
        active={active && !scanning && !favorites}
        onPhoto={add}
        onFiles={(files) => void importFiles(files)}
        onScan={() => setScanning(true)}
        onFavorites={() => setFavorites(true)}
      />
      {draft.photos.length > 0 && <PhotoStrip photos={draft.photos} onRemove={removePhoto} />}
      {error && (
        <div role="alert" className="flex shrink-0 items-center gap-3 rounded-card border border-accent/30 bg-accent/10 py-3 pr-3 pl-4">
          <div className="min-w-0 flex-1">
            <p className="text-[15px] leading-snug">{error.message}</p>
            {error.detail && <p className="mt-0.5 line-clamp-2 text-[12px] text-text-2">{error.detail}</p>}
          </div>
          {error.action && (
            <button
              type="button"
              onClick={error.action === 'retry' ? () => void analyze() : openSettingsOnTop}
              className="h-9 shrink-0 rounded-full px-3 text-[15px] font-semibold text-accent"
            >
              {error.action === 'retry' ? 'Réessayer' : 'Paramètres'}
            </button>
          )}
        </div>
      )}
      <button
        type="button"
        disabled={!canAnalyze}
        onClick={() => void analyze()}
        className="press h-14 shrink-0 rounded-full bg-accent text-[17px] font-semibold text-black shadow-accent disabled:opacity-35 disabled:shadow-none"
      >
        Analyser
        {draft.photos.length > 0 && ` · ${draft.photos.length} photo${draft.photos.length > 1 ? 's' : ''}`}
      </button>
      <BarcodeScanner open={scanning} onClose={() => setScanning(false)} onAdd={(item) => addItems([item])} />
      <FavoritesSheet open={favorites} uid={uid} onClose={() => setFavorites(false)} onAdd={addItems} />
    </div>
  )
}
