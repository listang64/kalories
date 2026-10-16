import { motion } from 'motion/react'

interface Props {
  size: number
  label: string
  onPress: () => void
}

export function OrbCss({ size, label, onPress }: Props) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={onPress}
      whileTap={{ scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 500, damping: 22 }}
      className="relative rounded-full"
      style={{ width: size, height: size }}
    >
      <span className="orb-breathe absolute inset-0 overflow-hidden rounded-full shadow-[0_0_48px_rgba(170,60,200,0.35)]">
        <span className="orb-swirl absolute -inset-1/4 blur-md" />
        <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_32%_26%,rgba(255,255,255,0.5),transparent_42%)]" />
        <span className="absolute inset-0 rounded-full shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14),inset_0_-10px_24px_rgba(0,0,0,0.35)]" />
      </span>
    </motion.button>
  )
}
