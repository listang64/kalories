import type { ReactNode } from 'react'
import { motion } from 'motion/react'

export function BigButton({
  children,
  onClick,
  disabled = false,
  tone = 'accent',
}: {
  children: ReactNode
  onClick: () => void
  disabled?: boolean
  tone?: 'accent' | 'soft' | 'danger'
}) {
  const colors = {
    accent: 'bg-accent text-black shadow-accent',
    soft: 'bg-white/8 text-text',
    danger: 'bg-white/8 text-[#FF6B6B]',
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`press flex h-14 w-full shrink-0 items-center justify-center gap-2 rounded-full px-5 text-[17px] font-semibold disabled:opacity-35 ${colors[tone]}`}
    >
      {children}
    </button>
  )
}

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-card border border-line bg-surface-2 p-4 ${className}`}>{children}</section>
}

export function Stage({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="flex min-h-full flex-col gap-4 pb-2"
    >
      {children}
    </motion.div>
  )
}

export function Hero({ emoji, title, text }: { emoji: string; title: ReactNode; text?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 py-6 text-center">
      <span className="text-[56px] leading-none">{emoji}</span>
      <h3 className="text-[26px] leading-tight font-semibold tracking-[-0.01em]">{title}</h3>
      {text && <p className="max-w-72 text-[15px] leading-snug text-text-2">{text}</p>}
    </div>
  )
}

export function Counter({
  label,
  value,
  min,
  max,
  onChange,
  nowrap = false,
}: {
  label: string
  nowrap?: boolean
  value: number
  min: number
  max: number
  onChange: (value: number) => void
}) {
  const step = (delta: number) => onChange(Math.min(max, Math.max(min, value + delta)))
  const button = 'press grid size-9 place-items-center rounded-full bg-white/8 text-[22px] font-semibold disabled:opacity-30'
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={`min-w-0 text-[16px] leading-tight ${nowrap ? 'whitespace-nowrap' : ''}`}>{label}</span>
      <span className="flex shrink-0 items-center gap-1.5">
        <button type="button" aria-label={`${label} : moins`} disabled={value <= min} onClick={() => step(-1)} className={button}>
          −
        </button>
        <span className="w-7 text-center text-[20px] font-semibold tabular-nums" aria-live="polite">
          {value}
        </span>
        <button type="button" aria-label={`${label} : plus`} disabled={value >= max} onClick={() => step(1)} className={button}>
          +
        </button>
      </span>
    </div>
  )
}

export function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`press rounded-full border px-3.5 py-2 text-[14px] ${active ? 'border-accent bg-accent/12 text-text' : 'border-line text-text-2'}`}
    >
      {children}
    </button>
  )
}

export function PlayerGrid({
  seats,
  names,
  selected,
  onSelect,
}: {
  seats: number[]
  names: (seat: number) => string
  selected: number | null
  onSelect: (seat: number) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {seats.map((seat) => (
        <button
          key={seat}
          type="button"
          aria-pressed={selected === seat}
          onClick={() => onSelect(seat)}
          className={`press min-h-14 rounded-card border px-3 py-2 text-[17px] font-semibold break-words ${
            selected === seat ? 'border-accent bg-accent/15 text-text' : 'border-line bg-surface-2 text-text'
          }`}
        >
          {names(seat)}
        </button>
      ))}
    </div>
  )
}

export function Label({ children }: { children: ReactNode }) {
  return <p className="label mb-2.5 text-accent">{children}</p>
}
