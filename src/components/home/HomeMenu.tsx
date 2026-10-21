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

const FIRST = 34
const STEP = 58
const BRANCH = 22
const TAIL = 30
const SLIDE = { type: 'spring', stiffness: 420, damping: 34 } as const
const HUB = 'grid size-11 shrink-0 place-items-center rounded-full bg-accent text-black shadow-accent'

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

export function MenuPanel({ anchor, onClose, onSelect }: MenuProps) {
  const reduce = useReducedMotion() === true
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
            className="pointer-events-none absolute inset-y-0 right-0 w-[min(92vw,440px)] bg-[linear-gradient(to_left,rgba(0,0,0,0.86),rgba(0,0,0,0.72)_42%,rgba(0,0,0,0.34)_72%,transparent)] backdrop-blur-[3px] [mask-image:linear-gradient(to_left,#000_55%,transparent)]"
            initial={{ opacity: 0, x: reduce ? 0 : 60 }}
            animate={{ opacity: 1, x: 0, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } }}
            exit={{ opacity: 0, x: reduce ? 0 : 60, transition: { duration: 0.26, delay: 0.1 } }}
          />
          <nav aria-label="Menu">
            <Rail anchor={anchor} reduce={reduce} />
            {ITEMS.map((item, index) => (
              <motion.div
                key={item.target}
                className="absolute flex -translate-y-1/2 items-center"
                style={{ right: railRight(anchor) + BRANCH - 4, top: itemTop(anchor, index) }}
                initial={{ x: reduce ? 0 : '110vw', opacity: 0 }}
                animate={{ x: 0, opacity: 1, transition: { ...SLIDE, delay: 0.08 + index * 0.06 } }}
                exit={{ x: reduce ? 0 : '110vw', opacity: 0, transition: { duration: 0.22, delay: (ITEMS.length - 1 - index) * 0.03 } }}
              >
                <button
                  type="button"
                  autoFocus={index === 0}
                  onClick={() => onSelect(item.target)}
                  className="press rounded-full px-3 py-2 text-[24px] leading-none font-semibold tracking-[-0.01em] whitespace-nowrap text-accent [text-shadow:0_0_18px_rgba(255,122,26,0.45)] outline-none focus-visible:bg-white/10"
                >
                  {item.label}
                </button>
              </motion.div>
            ))}
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

const railRight = (rect: DOMRect) => window.innerWidth - (rect.left + rect.width / 2)
const itemTop = (rect: DOMRect, index: number) => rect.bottom + FIRST + index * STEP

function Rail({ anchor, reduce }: { anchor: DOMRect; reduce: boolean }) {
  const top = anchor.bottom + 4
  const height = itemTop(anchor, ITEMS.length - 1) + TAIL - top
  const right = railRight(anchor)

  return (
    <div aria-hidden="true" className="pointer-events-none absolute" style={{ right, top, height, width: 0 }}>
      <motion.div
        className="absolute inset-y-0 -left-px w-[2px] origin-top rounded-full bg-[linear-gradient(to_bottom,rgba(255,122,26,0.7),rgba(255,122,26,0.35)_70%,transparent)]"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1, transition: { duration: reduce ? 0 : 0.4, ease: 'easeOut' } }}
        exit={{ scaleY: 0, transition: { duration: 0.2, delay: 0.1 } }}
      />
      {!reduce && (
        <motion.div
          className="absolute -left-[1.5px] h-16 w-[3px] rounded-full bg-[linear-gradient(to_bottom,transparent,#ffb27a,transparent)] blur-[0.5px]"
          initial={{ y: -64, opacity: 0 }}
          animate={{ y: [-64, height], opacity: [0, 1, 1, 0], transition: { duration: 2.6, ease: 'easeInOut', repeat: Infinity, delay: 0.5 } }}
          exit={{ opacity: 0 }}
        />
      )}
      {ITEMS.map((item, index) => {
        const y = itemTop(anchor, index) - top
        return (
          <div key={item.target} className="absolute" style={{ top: y }}>
            <motion.span
              className="absolute top-0 right-0 h-[1.5px] origin-right -translate-y-1/2 rounded-full bg-accent/50"
              style={{ width: BRANCH }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1, transition: { duration: 0.25, delay: 0.16 + index * 0.06 } }}
              exit={{ scaleX: 0, transition: { duration: 0.12 } }}
            />
            <motion.span
              className="absolute top-0 left-0 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_10px_rgba(255,122,26,0.8)]"
              initial={{ scale: 0 }}
              animate={
                reduce
                  ? { scale: 1 }
                  : { scale: [0, 1.3, 1, 1.25, 1], transition: { duration: 2.4, times: [0, 0.12, 0.2, 0.6, 1], repeat: Infinity, repeatDelay: 0.4, delay: 0.16 + index * 0.06 } }
              }
              exit={{ scale: 0, transition: { duration: 0.12 } }}
            />
          </div>
        )
      })}
    </div>
  )
}
