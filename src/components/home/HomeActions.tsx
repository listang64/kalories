import { motion } from 'motion/react'
import { CartIcon } from '../icons/CartIcon'
import { ChartIcon } from '../icons/ChartIcon'
import { AddButton } from './AddButton'

interface Props {
  shoppingCount: number
  onHistory: () => void
  onAdd: () => void
  onShopping: () => void
}

const TAP = { scale: 0.9 }
const SPRING = { type: 'spring', stiffness: 500, damping: 24 } as const

export function HomeActions({ shoppingCount, onHistory, onAdd, onShopping }: Props) {
  return (
    <div className="grid grid-cols-3 items-center">
      <div className="flex justify-start">
        <motion.button
          type="button"
          aria-label="Historique des 30 derniers jours"
          onClick={onHistory}
          whileTap={TAP}
          transition={SPRING}
          className="grid size-13 place-items-center rounded-full border border-line bg-surface-2 text-text"
        >
          <ChartIcon />
        </motion.button>
      </div>
      <div className="flex justify-center">
        <AddButton onPress={onAdd} />
      </div>
      <div className="flex justify-end">
        <motion.button
          type="button"
          aria-label={`Liste de courses, ${shoppingCount} article${shoppingCount > 1 ? 's' : ''}`}
          onClick={onShopping}
          whileTap={TAP}
          transition={SPRING}
          className="relative grid size-13 place-items-center rounded-full bg-accent text-black shadow-[0_0_22px_rgba(255,122,26,0.35)]"
        >
          <CartIcon />
          {shoppingCount > 0 && (
            <motion.span
              key={shoppingCount}
              initial={{ scale: 0.4 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 600, damping: 18 }}
              className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full border-2 border-bg bg-text px-1 text-[11px] font-semibold text-black tabular-nums"
            >
              {shoppingCount}
            </motion.span>
          )}
        </motion.button>
      </div>
    </div>
  )
}
