import { useState } from 'react'
import { sharedErrorMessage } from '../../lib/shared'
import { deleteShoppingItem, updateShoppingItem, type ShoppingItem } from '../../lib/shopping'
import { useAppStore } from '../../store/appStore'
import { BottomPanel } from '../BottomPanel'
import { Field, FIELD_INPUT } from '../Field'

interface Props {
  item: ShoppingItem | null
  onClose: () => void
}

export function ItemEditor({ item, onClose }: Props) {
  return (
    <BottomPanel open={item !== null} label="Modifier l’article" onClose={onClose}>
      {item && <EditorForm key={item.id} item={item} onClose={onClose} />}
    </BottomPanel>
  )
}

function EditorForm({ item, onClose }: { item: ShoppingItem; onClose: () => void }) {
  const [name, setName] = useState(item.name)
  const [quantity, setQuantity] = useState(item.quantity)
  const showToast = useAppStore((s) => s.showToast)
  const fail = (error: unknown) => showToast(sharedErrorMessage(error))

  const save = () => {
    if (!name.trim()) return
    updateShoppingItem(item, name, quantity).catch(fail)
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
          className={FIELD_INPUT}
        />
      </Field>
      <Field label="Quantité">
        <input
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          maxLength={40}
          placeholder="ex. 2, 500 g, 1 paquet"
          enterKeyHint="done"
          className={FIELD_INPUT}
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
