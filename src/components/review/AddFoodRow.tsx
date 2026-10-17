import { useState } from 'react'
import { analyzeFood } from '../../lib/analysis'
import { geminiErrorMessage } from '../../lib/gemini'
import { useLocalSettings } from '../../lib/localSettings'
import { useAppStore } from '../../store/appStore'
import { BarcodeIcon } from '../icons/BarcodeIcon'
import { PlusIcon } from '../icons/PlusIcon'
import { BarcodeScanner } from '../scanner/BarcodeScanner'

export function AddFoodRow() {
  const [food, setFood] = useState('')
  const [busy, setBusy] = useState(false)
  const [scanning, setScanning] = useState(false)

  const add = async () => {
    if (!food.trim() || busy) return
    const { session, showToast } = useAppStore.getState()
    const { geminiKey, geminiModel } = useLocalSettings.getState()
    setBusy(true)
    try {
      const result = await analyzeFood(food, geminiKey, geminiModel)
      if (useAppStore.getState().session !== session) return
      if (result.items.length === 0) return showToast(result.comment || 'Aliment non reconnu')
      useAppStore.getState().appendItems(result.items)
      setFood('')
    } catch (error) {
      showToast(geminiErrorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-card border border-dashed border-white/15 py-1.5 pr-2 pl-4">
      <span className="text-text-2">
        <PlusIcon size={20} />
      </span>
      <input
        aria-label="Ajouter un aliment"
        value={food}
        onChange={(e) => setFood(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && void add()}
        placeholder="Ajouter un aliment…"
        enterKeyHint="send"
        className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-text-2"
      />
      <button
        type="button"
        onClick={() => void add()}
        disabled={!food.trim() || busy}
        className="h-10 rounded-full px-3 text-[15px] font-semibold text-accent disabled:opacity-40"
      >
        {busy ? 'Analyse…' : 'Ajouter'}
      </button>
      <button
        type="button"
        aria-label="Scanner un code-barres"
        onClick={() => setScanning(true)}
        className="grid size-10 shrink-0 place-items-center rounded-full text-accent"
      >
        <BarcodeIcon size={22} />
      </button>
      <BarcodeScanner
        open={scanning}
        onClose={() => setScanning(false)}
        onAdd={(item) => {
          useAppStore.getState().appendItems([item])
          setScanning(false)
        }}
      />
    </div>
  )
}
