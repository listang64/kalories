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

const FIRST_ANGLE = 6
const STEP_ANGLE = 19
const INNER = 100
const TRACK = 74
const HALO = 360
const SPRING = { type: 'spring', stiffness: 240, damping: 24 } as const
const HUB = 'grid size-11 shrink-0 place-items-center rounded-full bg-accent text-black shadow-accent'

const angleOf = (index: number) => FIRST_ANGLE + index * STEP_ANGLE
const LINE = 'absolute left-0 h-[2px] w-full rounded-full bg-current'
const FLAT = { y: 0, rotate: 0 }

function MenuLines({ cross }: { cross: boolean }) {
  return (
    <span className="relative block h-3.5 w-[18px]">
      <motion.span className={`${LINE} top-0`} initial={FLAT} animate={cross ? { y: 6, rotate: 45 } : FLAT} exit={FLAT} />
      <motion.span
        className={`${LINE} top-[6px]`}
        initial={{ opacity: 1, scaleX: 1 }}
        animate={cross ? { opacity: 0, scaleX: 0.2 } : { opacity: 1, scaleX: 1 }}
        exit={{ opacity: 1, scaleX: 1 }}
      />
      <motion.span className={`${LINE} top-[12px]`} initial={FLAT} animate={cross ? { y: -6, rotate: -45 } : FLAT} exit={FLAT} />
    </span>
  )
}

export function MenuButton({ open, onOpen }: { open: boolean; onOpen: (anchor: DOMRect) => void }) {
  return (
    <button
      type="button"
      aria-label="Ouvrir le menu"
      aria-expanded={open}
      onClick={(event) => onOpen(event.currentTarget.getBoundingClientRect())}
      className={`press ${HUB}`}
    >
      <MenuLines cross={false} />
    </button>
  )
}

interface MenuProps {
  anchor: DOMRect | null
  onClose: () => void
  onSelect: (target: MenuTarget) => void
}

export function RadialMenu({ anchor, onClose, onSelect }: MenuProps) {
  const reduce = useReducedMotion() === true
  const swing = reduce ? 0 : 100
  const open = anchor !== null

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {anchor && (
        <div className="fixed inset-0 z-30">
          <button type="button" aria-label="Fermer le menu" onClick={onClose} className="absolute inset-0 cursor-default" />
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute rounded-full bg-[radial-gradient(closest-side,rgba(0,0,0,0.8),rgba(0,0,0,0.72)_48%,rgba(0,0,0,0.38)_74%,transparent)] backdrop-blur-[3px] [mask-image:radial-gradient(closest-side,#000_62%,transparent)]"
            style={{ width: HALO * 2, height: HALO * 2, left: center(anchor).x - HALO, top: center(anchor).y - HALO }}
            initial={{ scale: reduce ? 1 : 0.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] } }}
            exit={{ scale: reduce ? 1 : 0.3, opacity: 0, transition: { duration: 0.28, delay: 0.08 } }}
          />
          <nav aria-label="Menu" className="absolute size-0" style={{ left: center(anchor).x, top: center(anchor).y }}>
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
          <button
            type="button"
            aria-label="Fermer le menu"
            onClick={onClose}
            className={`absolute ${HUB}`}
            style={{ left: anchor.left, top: anchor.top }}
          >
            <MenuLines cross />
          </button>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

const center = (rect: DOMRect) => ({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })

function Track({ reduce }: { reduce: boolean }) {
  const size = (TRACK + 8) * 2
  const point = (angle: number) => {
    const radians = (angle * Math.PI) / 180
    return { x: size / 2 - TRACK * Math.cos(radians), y: size / 2 + TRACK * Math.sin(radians) }
  }
  const start = point(-30)
  const end = point(105)

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      className="absolute overflow-visible text-accent"
      style={{ left: -size / 2, top: -size / 2 }}
    >
      <motion.path
        d={`M ${start.x} ${start.y} A ${TRACK} ${TRACK} 0 0 0 ${end.x} ${end.y}`}
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
