import type { ReactNode } from 'react'
import { motion } from 'motion/react'

interface Props {
  index: number
  className?: string
  children: ReactNode
}

export function Rise({ index, className, children }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 30, delay: index * 0.06 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
