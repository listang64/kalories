import { motion } from 'motion/react'
import { PlusIcon } from '../icons/PlusIcon'

export function AddButton({ onPress }: { onPress: () => void }) {
  return (
    <div className="relative grid place-items-center">
      <span
        aria-hidden="true"
        className="halo-pulse pointer-events-none absolute -inset-5 rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--color-accent)_50%,transparent),color-mix(in_srgb,var(--color-accent)_16%,transparent)_72%,transparent)]"
      />
      <span aria-hidden="true" className="halo-pulse pointer-events-none absolute -inset-2 rounded-full border border-accent/35" />
      <motion.button
        type="button"
        aria-label="Ajouter un repas"
        onClick={onPress}
        whileTap={{ scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 500, damping: 24 }}
        className="grid size-22 place-items-center rounded-full bg-accent text-black shadow-[0_0_36px_color-mix(in_srgb,var(--color-accent)_45%,transparent)]"
      >
        <PlusIcon size={40} strokeWidth={2} />
      </motion.button>
    </div>
  )
}
