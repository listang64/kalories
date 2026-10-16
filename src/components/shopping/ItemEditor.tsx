import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useKeyboardInset } from '../../hooks/useKeyboardInset'
import { deleteShoppingItem, updateShoppingItem, type ShoppingItem } from '../../lib/shopping'
import { useAppStore } from '../../store/appStore'

interface Props {
  item: ShoppingItem | null
  onClose: () => void
}

export function ItemEditor({ item, onClose }: Props) {
  const inset = useKeyboardInset()

  return (
    <AnimatePresence>
      {item && (
        <div className="fixed inset-0 z-50">
          <motion.div
            className="absolute inset-0 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Modifier l’article"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 420, damping: 40 }}
            style={{ bottom: inset }}
            className="absolute inset-x-0 rounded-t-sheet border-t border-line bg-surface-2 px-5 pt-2 pb-[calc(var(--safe-bottom)+16px)]"
          >
            <div className="mx-auto h-1.5 w-10 rounded-full bg-white/20" />
            <EditorForm key={item.id} item={item} onClose={onClose} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

function EditorForm({ item, onClose }: { item: ShoppingItem; onClose: () => void }) {
  const [name, setName] = useState(item.name)
  const [quantity, setQuantity] = useState(item.quantity)
  const showToast = useAppStore((s) => s.showToast)
  const fail = () => showToast('Action impossible')

  const save = () => {
    if (!name.trim()) return
    updateShoppingItem(item.id, name, quantity).catch(fail)
    onClose()
  }

  const remove = () => {
    deleteShoppingItem(item.id).catch(fail)
    onClose()
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        save()
      }}
      className="mt-4 flex flex-col gap-3"
    >
      <h3 className="text-[17px] font-semibold">Modifier l’article</h3>
      <Field label="Article">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
          enterKeyHint="done"
          className="mt-1.5 h-12 w-full rounded-card border border-line bg-black/30 px-4 text-base outline-none focus:border-white/20"
        />
      </Field>
      <Field label="Quantité">
        <input
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          maxLength={40}
          placeholder="ex. 2, 500 g, 1 paquet"
          enterKeyHint="done"
          className="mt-1.5 h-12 w-full rounded-card border border-line bg-black/30 px-4 text-base outline-none placeholder:text-text-2 focus:border-white/20"
        />
      </Field>
      <div className="mt-2 grid grid-cols-2 gap-2.5">
        <button type="button" onClick={remove} className="press h-12 rounded-full bg-white/8 text-[15px] font-medium text-accent">
          Supprimer
        </button>
        <button
          type="submit"
          disabled={!name.trim()}
          className="press h-12 rounded-full bg-accent text-[15px] font-semibold text-black disabled:opacity-40"
        >
          Enregistrer
        </button>
      </div>
    </form>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="label px-1">{label}</span>
      {children}
    </label>
  )
}
