import { useState } from 'react'
import { classifyAisles } from '../../lib/aisles'
import { geminiErrorMessage } from '../../lib/gemini'
import { useLocalSettings } from '../../lib/localSettings'
import { saveAisles, shoppingErrorMessage, type ShoppingItem } from '../../lib/shopping'
import { useAppStore } from '../../store/appStore'

export function SortButton({ items }: { items: ShoppingItem[] }) {
  const [sorting, setSorting] = useState(false)
  const showToast = useAppStore((s) => s.showToast)
  const pending = items.filter((item) => item.aisle === null)

  const sort = async () => {
    const { geminiKey, geminiModel } = useLocalSettings.getState()
    if (!geminiKey) return showToast('Ajoute ta clé Gemini dans les Paramètres')
    setSorting(true)
    try {
      const aisles = await classifyAisles(pending, geminiKey, geminiModel)
      saveAisles(aisles).catch((error: unknown) => showToast(shoppingErrorMessage(error)))
    } catch (error) {
      showToast(geminiErrorMessage(error))
    } finally {
      setSorting(false)
    }
  }

  return (
    <button
      type="button"
      onClick={() => void sort()}
      disabled={sorting || pending.length === 0}
      className={`h-10 px-2 text-[17px] font-semibold text-accent disabled:opacity-40 ${sorting ? 'animate-pulse disabled:opacity-100' : ''}`}
    >
      {sorting ? 'Tri…' : 'Trier'}
    </button>
  )
}
