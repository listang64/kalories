import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import type { Overlay } from '../../store/appStore'

export type MenuTarget = Extract<Overlay, 'loans' | 'recipes' | 'history' | 'settings'>

const ITEMS: { target: MenuTarget; label: string }[] = [
  { target: 'loans', label: 'Prêts' },
  { target: 'recipes', label: 'Recettes' },
  { target: 'history', label: 'Statistiques' },
  { target: 'settings', label: 'Paramètres' },
]

const FIRST_ANGLE = 13
const STEP_ANGLE = 17
const INNER = 82
const TRACK = 68
const HALO = 300
const SPRING = { type: 'spring', stiffness: 240, damping: 24 } as const

const angleOf = (index: number) => FIRST_ANGLE + index * STEP_ANGLE
const LINE = 'absolute left-0 h-[2px] w-full rounded-full bg-current'

export function MenuButton({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
      aria-expanded={open}
      onClick={onToggle}
      className="press grid size-11 shrink-0 place-items-center rounded-full bg-accent text-black shadow-accent"
    >
      <span className="relative block h-3.5 w-[18px]">
        <motion.span className={`${LINE} top-0`} animate={open ? { y: 6, rotate: 45 } : { y: 0, rotate: 0 }} />
        <motion.span className={`${LINE} top-[6px]`} animate={{ opacity: open ? 0 : 1, scaleX: open ? 0.2 : 1 }} />
        <motion.span className={`${LINE} top-[12px]`} animate={open ? { y: -6, rotate: -45 } : { y: 0, rotate: 0 }} />
      </span>
    </button>
  )
}

interface MenuProps {
  open: boolean
  onClose: () => void
  onSelect: (target: MenuTarget) => void
}

export function RadialMenu({ open, onClose, onSelect }: MenuProps) {
  const reduce = useReducedMotion() === true
  const swing = reduce ? 0 : 100

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-30">
          <button type="button" aria-label="Fermer le menu" onClick={onClose} className="absolute inset-0 cursor-default" />
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute rounded-full bg-[radial-gradient(closest-side,rgba(0,0,0,0.8),rgba(0,0,0,0.72)_48%,rgba(0,0,0,0.38)_74%,transparent)] backdrop-blur-[3px] [mask-image:radial-gradient(closest-side,#000_62%,transparent)]"
            style={{ width: HALO * 2, height: HALO * 2, right: -HALO, top: `calc(var(--safe-top) - ${HALO}px)` }}
            initial={{ scale: reduce ? 1 : 0.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] } }}
            exit={{ scale: reduce ? 1 : 0.3, opacity: 0, transition: { duration: 0.28, delay: 0.08 } }}
          />
          <nav aria-label="Menu" className="absolute top-[var(--safe-top)] right-0 size-0">
            <Track reduce={reduce} />
            {ITEMS.map((item, index) => {
              const rotate = -angleOf(index)
              return (
                <motion.div
                  key={item.target}
                  className="absolute top-0 right-0 flex h-0 items-center"
                  style={{ originX: 1, originY: 0.5 }}
                  initial={{ rotate: rotate + swing, opacity: 0 }}
                  animate={{ rotate, opacity: 1, transition: { ...SPRING, delay: 0.06 + index * 0.06 } }}
                  exit={{ rotate: rotate + swing, opacity: 0, transition: { duration: 0.24, delay: (ITEMS.length - 1 - index) * 0.03 } }}
                >
                  <button
                    type="button"
                    autoFocus={index === 0}
                    onClick={() => onSelect(item.target)}
                    className="press rounded-full px-2.5 py-1.5 text-[22px] leading-none font-semibold tracking-[-0.01em] whitespace-nowrap text-accent [text-shadow:0_0_18px_rgba(255,122,26,0.45)] outline-none focus-visible:bg-white/10"
                    style={{ marginRight: INNER - 10 }}
                  >
                    {item.label}
                  </button>
                </motion.div>
              )
            })}
          </nav>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

function Track({ reduce }: { reduce: boolean }) {
  const size = TRACK + 8
  const point = (angle: number) => {
    const radians = (angle * Math.PI) / 180
    return { x: size - TRACK * Math.cos(radians), y: TRACK * Math.sin(radians) }
  }

  return (
    <svg aria-hidden="true" width={size} height={size} className="absolute top-0 right-0 overflow-visible text-accent">
      <motion.path
        d={`M ${size - TRACK} 0 A ${TRACK} ${TRACK} 0 0 0 ${size} ${TRACK}`}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.35}
        strokeWidth={1.5}
        strokeLinecap="round"
        initial={{ pathLength: reduce ? 1 : 0 }}
        animate={{ pathLength: 1, transition: { duration: 0.5, ease: 'easeOut' } }}
        exit={{ pathLength: 0, transition: { duration: 0.2 } }}
      />
      {ITEMS.map((item, index) => {
        const { x, y } = point(angleOf(index))
        return (
          <motion.circle
            key={item.target}
            cx={x}
            cy={y}
            r={3}
            fill="currentColor"
            initial={{ scale: 0 }}
            animate={{ scale: 1, transition: { ...SPRING, delay: 0.18 + index * 0.06 } }}
            exit={{ scale: 0, transition: { duration: 0.15 } }}
          />
        )
      })}
    </svg>
  )
}
