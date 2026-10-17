import { motion } from 'motion/react'
import type { ShoppingItem } from '../../lib/shopping'
import { usePerson } from '../../store/sessionStore'
import { TrashIcon } from '../icons/TrashIcon'
import { SwipeButton } from '../SwipeButton'

interface Props {
  item: ShoppingItem
  onEdit: () => void
  onDelete: () => void
}

export function ShoppingBubble({ item, onEdit, onDelete }: Props) {
  const author = usePerson(item.addedBy)
  const label = item.quantity ? `${item.name}, ${item.quantity}` : item.name

  return (
    <motion.li
      layout
      initial={{ scale: 0.4, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ x: -160, opacity: 0, transition: { duration: 0.22 } }}
      transition={{ type: 'spring', stiffness: 520, damping: 28 }}
      className="list-none"
    >
      <SwipeButton
        label={`${label}. Toucher pour modifier, glisser à gauche pour supprimer`}
        action={<TrashIcon size={16} />}
        onTap={onEdit}
        onSwipe={onDelete}
        className="h-11 max-w-full rounded-full pr-4 pl-3 text-[16px] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
        contentClassName="flex min-w-0 items-center gap-2"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_28%_0%,rgba(255,255,255,0.12),transparent_60%)]"
        />
        <span
          className="relative size-2 shrink-0 rounded-full"
          style={{ background: author?.chartColor ?? 'var(--text-2)' }}
        />
        <span className="relative truncate">{item.name}</span>
        {item.quantity && <span className="relative shrink-0 text-text-2">· {item.quantity}</span>}
      </SwipeButton>
    </motion.li>
  )
}
