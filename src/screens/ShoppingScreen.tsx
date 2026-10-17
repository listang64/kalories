import { useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { DeniedBanner } from '../components/DeniedBanner'
import { CartIcon } from '../components/icons/CartIcon'
import { PlusIcon } from '../components/icons/PlusIcon'
import { ItemEditor } from '../components/shopping/ItemEditor'
import { ShoppingBubble } from '../components/shopping/ShoppingBubble'
import { AISLES } from '../config/aisles'
import type { Profile } from '../lib/profiles'
import { sharedErrorMessage } from '../lib/shared'
import {
  addShoppingItems,
  clearShoppingItems,
  deleteShoppingItem,
  splitNames,
  type ShoppingItem,
} from '../lib/shopping'
import { useAppStore } from '../store/appStore'

interface Props {
  me: Profile
  partner: Profile | null
  items: ShoppingItem[]
  denied: boolean
}

interface Group {
  id: string
  label: string
  items: ShoppingItem[]
}

function groupByAisle(items: ShoppingItem[]): Group[] {
  const pending = items.filter((item) => item.aisle === null)
  const sorted = AISLES.map((aisle) => ({ ...aisle, items: items.filter((item) => item.aisle === aisle.id) })).filter(
    (group) => group.items.length > 0,
  )
  if (pending.length === 0) return sorted
  return [{ id: 'pending', label: sorted.length > 0 ? 'À trier' : '', items: pending }, ...sorted]
}

export function ShoppingScreen({ me, partner, items, denied }: Props) {
  const [text, setText] = useState('')
  const [editing, setEditing] = useState<ShoppingItem | null>(null)
  const [clearing, setClearing] = useState(false)
  const showToast = useAppStore((s) => s.showToast)
  const fail = (error: unknown) => showToast(sharedErrorMessage(error))

  const add = (event: FormEvent) => {
    event.preventDefault()
    const names = splitNames(text)
    if (names.length === 0) return
    addShoppingItems(names, me.uid).catch(fail)
    setText('')
  }

  return (
    <div className="flex h-full flex-col">
      <form onSubmit={add} className="flex shrink-0 items-center gap-2 rounded-full border border-line bg-surface-2 py-1.5 pr-1.5 pl-4">
        <input
          aria-label="Nouvel article"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ajouter (lait, pain, œufs…)"
          enterKeyHint="send"
          autoCapitalize="sentences"
          className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-text-2"
        />
        <button
          type="submit"
          aria-label="Ajouter à la liste"
          disabled={!text.trim()}
          className="press grid size-10 shrink-0 place-items-center rounded-full bg-accent text-black disabled:opacity-35"
        >
          <PlusIcon size={20} strokeWidth={2} />
        </button>
      </form>
      {denied && <DeniedBanner what="à la liste de courses" />}
      <div className="mt-5 flex shrink-0 items-center px-1">
        <p className="label flex-1">
          {items.length} article{items.length > 1 ? 's' : ''}
        </p>
        {items.length > 0 && (
          <button type="button" onClick={() => setClearing(true)} className="h-8 text-[14px] text-text-2">
            Vider la liste
          </button>
        )}
      </div>
      <div className="-mx-5 mt-3 min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-5 pb-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 pt-14 text-center">
            <span className="text-text-2">
              <CartIcon size={40} strokeWidth={1.5} />
            </span>
            <p className="text-[17px] font-semibold">La liste est vide</p>
            <p className="max-w-64 text-[15px] text-text-2">
              {partner ? `Ajoute ce qu’il faut acheter, ${partner.name} le verra aussitôt.` : 'Ajoute ce qu’il faut acheter.'}
            </p>
          </div>
        ) : (
          <ul className="flex flex-wrap gap-2.5">
            <AnimatePresence initial={false}>
              {groupByAisle(items).flatMap((group) => [
                ...(group.label ? [<AisleLabel key={`aisle-${group.id}`} label={group.label} />] : []),
                ...group.items.map((item) => (
                  <ShoppingBubble
                    key={item.id}
                    item={item}
                    onEdit={() => setEditing(item)}
                    onDelete={() => deleteShoppingItem(item.id).catch(fail)}
                  />
                )),
              ])}
            </AnimatePresence>
          </ul>
        )}
      </div>
      {items.length > 0 && (
        <p className="shrink-0 pt-2 text-center text-[12px] text-text-2">
          Touche une bulle pour la modifier · glisse-la à gauche pour la supprimer
        </p>
      )}
      <ItemEditor item={editing} onClose={() => setEditing(null)} />
      <ConfirmDialog
        open={clearing}
        title="Vider la liste ?"
        message={partner ? 'Tous les articles seront supprimés, pour vous deux.' : 'Tous les articles seront supprimés.'}
        confirmLabel="Vider"
        cancelLabel="Annuler"
        onCancel={() => setClearing(false)}
        onConfirm={() => {
          setClearing(false)
          clearShoppingItems(items.map((item) => item.id)).catch(fail)
        }}
      />
    </div>
  )
}

function AisleLabel({ label }: { label: string }) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="label basis-full list-none px-1 pt-3 first:pt-0"
    >
      {label}
    </motion.li>
  )
}
