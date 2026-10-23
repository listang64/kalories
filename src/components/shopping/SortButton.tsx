import { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'motion/react'
import { classifyAisles } from '../../lib/aisles'
import { geminiErrorMessage } from '../../lib/gemini'
import { useLocalSettings } from '../../lib/localSettings'
import { sharedErrorMessage } from '../../lib/shared'
import { saveAisles, type ShoppingItem } from '../../lib/shopping'
import { useAppStore } from '../../store/appStore'
import { LoadingDots } from '../LoadingDots'

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
      saveAisles(aisles).catch((error: unknown) => showToast(sharedErrorMessage(error)))
    } catch (error) {
      showToast(geminiErrorMessage(error))
    } finally {
      setSorting(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => void sort()}
        disabled={sorting || pending.length === 0}
        className="press h-10 rounded-full bg-accent px-5 text-[17px] font-semibold text-black disabled:opacity-40"
      >
        {sorting ? 'Tri…' : 'Trier'}
      </button>
      {sorting &&
        createPortal(
          <motion.div
            role="status"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/75"
          >
            <p className="text-[32px] font-bold text-accent">Tri en cours</p>
            <span className="text-accent">
              <LoadingDots />
            </span>
          </motion.div>,
          document.body,
        )}
    </>
  )
}
