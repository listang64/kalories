import { motion } from 'motion/react'
import { HeartIcon } from '../icons/HeartIcon'

interface Props {
  name: string
  favorite: boolean
  onToggle: () => void
  size?: number
}

export function FavoriteToggle({ name, favorite, onToggle, size = 22 }: Props) {
  return (
    <motion.button
      type="button"
      aria-label={favorite ? `Retirer ${name} des favoris` : `Mettre ${name} en favori`}
      aria-pressed={favorite}
      onClick={onToggle}
      whileTap={{ scale: 0.8 }}
      className={`grid size-11 shrink-0 place-items-center rounded-full transition-colors ${favorite ? 'text-accent' : 'text-text-2'}`}
    >
      <HeartIcon size={size} filled={favorite} />
    </motion.button>
  )
}
