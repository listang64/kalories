import { useRef, type ReactNode } from 'react'
import { motion, useMotionValue, useTransform } from 'motion/react'

interface Props {
  label: string
  action: ReactNode
  onTap: () => void
  onSwipe: () => void
  className: string
  contentClassName: string
  children: ReactNode
}

const SWIPE = 72

export function SwipeButton({ label, action, onTap, onSwipe, className, contentClassName, children }: Props) {
  const x = useMotionValue(0)
  const backgroundColor = useTransform(x, [-SWIPE, 0], ['rgba(255,122,26,0.95)', 'rgba(26,26,29,1)'])
  const reveal = useTransform(x, [-SWIPE, -16], [1, 0])
  const fade = useTransform(x, [-SWIPE, -16], [0, 1])
  const dragged = useRef(false)

  return (
    <motion.button
      type="button"
      aria-label={label}
      drag="x"
      dragDirectionLock
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={{ left: 0.9, right: 0.04 }}
      style={{ x, backgroundColor }}
      onPointerDown={() => (dragged.current = false)}
      onDragStart={() => (dragged.current = true)}
      onDragEnd={(_, info) => {
        if (info.offset.x < -SWIPE || info.velocity.x < -700) onSwipe()
      }}
      onTap={() => !dragged.current && onTap()}
      onKeyDown={(e) => (e.key === 'Delete' || e.key === 'Backspace') && onSwipe()}
      className={`relative flex items-center overflow-hidden border border-line ${className}`}
    >
      <motion.span style={{ opacity: fade }} className={contentClassName}>
        {children}
      </motion.span>
      <motion.span style={{ opacity: reveal }} className="absolute right-3 text-black">
        {action}
      </motion.span>
    </motion.button>
  )
}
