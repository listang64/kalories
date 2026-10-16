import { useRef } from 'react'
import { motion, useMotionValue, useTransform } from 'motion/react'
import { profileByUid } from '../../config/users'
import type { ShoppingItem } from '../../lib/shopping'
import { TrashIcon } from '../icons/TrashIcon'

interface Props {
  item: ShoppingItem
  onEdit: () => void
  onDelete: () => void
}

const SWIPE = 72

export function ShoppingBubble({ item, onEdit, onDelete }: Props) {
  const x = useMotionValue(0)
  const backgroundColor = useTransform(x, [-SWIPE, 0], ['rgba(255,122,26,0.95)', 'rgba(26,26,29,1)'])
  const trash = useTransform(x, [-SWIPE, -16], [1, 0])
  const dragged = useRef(false)
  const author = profileByUid(item.addedBy)
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
      <motion.button
        type="button"
        aria-label={`${label}. Toucher pour modifier, glisser à gauche pour supprimer`}
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0.9, right: 0.04 }}
        style={{ x, backgroundColor }}
        onPointerDown={() => (dragged.current = false)}
        onDragStart={() => (dragged.current = true)}
        onDragEnd={(_, info) => {
          if (info.offset.x < -SWIPE || info.velocity.x < -700) onDelete()
        }}
        onTap={() => !dragged.current && onEdit()}
        onKeyDown={(e) => (e.key === 'Delete' || e.key === 'Backspace') && onDelete()}
        className="relative flex h-11 max-w-full items-center gap-2 overflow-hidden rounded-full border border-line pr-4 pl-3 text-[16px] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
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
        <motion.span style={{ opacity: trash }} className="absolute right-3 text-black">
          <TrashIcon size={16} />
        </motion.span>
      </motion.button>
    </motion.li>
  )
}
