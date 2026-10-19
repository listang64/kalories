import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useShoppingList } from '../../hooks/useShoppingList'
import type { Ingredient } from '../../lib/recipes'
import { sharedErrorMessage } from '../../lib/shared'
import { addShoppingItems, sameItem } from '../../lib/shopping'
import { useAppStore } from '../../store/appStore'
import { BottomPanel } from '../BottomPanel'
import { TrashIcon } from '../icons/TrashIcon'
import { SwipeButton } from '../SwipeButton'

interface Props {
  ingredients: Ingredient[] | null
  uid: string
  onClose: () => void
}

export function ShoppingPicker({ ingredients, uid, onClose }: Props) {
  return (
    <BottomPanel open={ingredients !== null} label="Ajouter à la liste de courses" onClose={onClose}>
      {ingredients && <Picker ingredients={ingredients} uid={uid} onClose={onClose} />}
    </BottomPanel>
  )
}

function Picker({ ingredients, uid, onClose }: { ingredients: Ingredient[]; uid: string; onClose: () => void }) {
  const { items } = useShoppingList()
  const already = ingredients.flatMap((ingredient, index) =>
    items.some((item) => sameItem(item.name, ingredient.name)) ? [index] : [],
  )
  const [manual, setManual] = useState<number[] | null>(null)
  const removed = manual ?? already
  const listed = already.filter((index) => removed.includes(index)).length
  const kept = ingredients
    .map((ingredient, index) => ({ ingredient, index }))
    .filter(({ index }) => !removed.includes(index))
  const showToast = useAppStore((s) => s.showToast)

  const send = () => {
    addShoppingItems(
      kept.map(({ ingredient }) => ingredient),
      uid,
    ).catch((error: unknown) => showToast(sharedErrorMessage(error)))
    showToast(`${kept.length} article${kept.length > 1 ? 's' : ''} ajouté${kept.length > 1 ? 's' : ''} à la liste`)
    onClose()
  }

  return (
    <div className="mt-4 flex flex-col">
      <h3 className="text-[17px] font-semibold">Ajouter à la liste de courses</h3>
      <p className="mt-1 text-[15px] text-text-2">Glisse à gauche ce que tu as déjà.</p>
      <ul className="-mx-5 mt-4 flex max-h-[46vh] flex-wrap content-start gap-2.5 overflow-x-hidden overflow-y-auto px-5 pb-1">
        <AnimatePresence initial={false}>
          {kept.map(({ ingredient, index }) => (
            <motion.li
              key={index}
              layout
              exit={{ x: -160, opacity: 0, transition: { duration: 0.22 } }}
              transition={{ type: 'spring', stiffness: 520, damping: 28 }}
              className="max-w-full list-none"
            >
              <SwipeButton
                label={`${ingredient.name}${ingredient.quantity ? `, ${ingredient.quantity}` : ''}. Glisser à gauche pour retirer`}
                action={<TrashIcon size={16} />}
                onTap={() => undefined}
                onSwipe={() => setManual([...removed, index])}
                className="h-11 max-w-full rounded-full pr-4 pl-4 text-[16px]"
                contentClassName="flex min-w-0 items-center gap-2"
              >
                <span className="truncate">{ingredient.name}</span>
                {ingredient.quantity && <span className="shrink-0 text-text-2">· {ingredient.quantity}</span>}
              </SwipeButton>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      {removed.length > 0 && (
        <div className="mt-3 flex items-center justify-between gap-3 px-1 text-[14px] text-text-2">
          <span>
            {removed.length} retiré{removed.length > 1 ? 's' : ''}
            {listed > 0 && ` · dont ${listed} déjà dans la liste`}
          </span>
          <button type="button" onClick={() => setManual([])} className="h-8 shrink-0 font-medium text-accent">
            Tout remettre
          </button>
        </div>
      )}
      <button
        type="button"
        disabled={kept.length === 0}
        onClick={send}
        className="press mt-4 h-13 w-full rounded-full bg-accent text-[16px] font-semibold text-black shadow-accent disabled:opacity-35 disabled:shadow-none"
      >
        {kept.length === 0 ? 'Rien à ajouter' : `Ajouter ${kept.length} article${kept.length > 1 ? 's' : ''}`}
      </button>
    </div>
  )
}
