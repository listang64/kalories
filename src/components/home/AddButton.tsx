import { motion } from 'motion/react'
import { PlusIcon } from '../icons/PlusIcon'

export function AddButton({ onPress }: { onPress: () => void }) {
  return (
    <motion.button
      type="button"
      aria-label="Ajouter un repas"
      onClick={onPress}
      whileTap={{ scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 500, damping: 24 }}
      className="grid size-20 place-items-center rounded-full bg-accent text-black shadow-[0_0_32px_rgba(255,122,26,0.45)]"
    >
      <PlusIcon size={36} strokeWidth={2} />
    </motion.button>
  )
}
