import { useState, type ReactNode } from 'react'
import { formatHoursInput, nextSlot, parseHours, type Slot } from '../../lib/hours/time'
import { CheckIcon } from '../icons/CheckIcon'
import { ChevronIcon } from '../icons/ChevronIcon'
import { CloseIcon } from '../icons/CloseIcon'
import { PlusIcon } from '../icons/PlusIcon'

export const GREEN = '#34C759'
export const RED = '#FF6B6B'

export const INPUT =
  'h-11 w-full min-w-0 appearance-none rounded-xl border border-line bg-black/30 px-3 text-[17px] tabular-nums outline-none focus:border-white/25 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-date-and-time-value]:text-left'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-card border border-line bg-surface-2 p-4 ${className}`}>{children}</section>
}

export function Title({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <h3 className="label text-accent">{children}</h3>
      {aside && <span className="text-[13px] text-text-2">{aside}</span>}
    </div>
  )
}

export function CheckRow({ checked, onChange, children }: { checked: boolean; onChange: (value: boolean) => void; children: ReactNode }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="press flex min-h-11 w-full items-center gap-3 text-left text-[16px]"
    >
      <span
        className={`grid size-6 shrink-0 place-items-center rounded-md border-2 ${checked ? 'border-accent bg-accent text-black' : 'border-white/25'}`}
      >
        {checked && <CheckIcon size={16} strokeWidth={3} />}
      </span>
      {children}
    </button>
  )
}

export function MonthNav({ label, onShift }: { label: string; onShift: (delta: number) => void }) {
  const button = 'press grid size-10 place-items-center rounded-full bg-white/8 text-text'
  return (
    <div className="flex items-center justify-between gap-2">
      <button type="button" aria-label="Précédent" onClick={() => onShift(-1)} className={button}>
        <ChevronIcon size={20} direction="left" />
      </button>
      <span className="text-[19px] font-semibold">{label}</span>
      <button type="button" aria-label="Suivant" onClick={() => onShift(1)} className={button}>
        <ChevronIcon size={20} direction="right" />
      </button>
    </div>
  )
}

export function SlotsEditor({ slots, onChange }: { slots: Slot[]; onChange: (slots: Slot[]) => void }) {
  const update = (index: number, patch: Partial<Slot>) =>
    onChange(slots.map((slot, i) => (i === index ? { ...slot, ...patch } : slot)))

  return (
    <div className="flex flex-col gap-2">
      {slots.length > 0 && (
        <div className="grid grid-cols-[1fr_1fr_40px] gap-2 px-1 text-[12px] text-text-2">
          <span>Début</span>
          <span>Fin</span>
        </div>
      )}
      {slots.map((slot, index) => (
        <div key={index} className="grid grid-cols-[1fr_1fr_40px] items-center gap-2">
          <input
            type="time"
            aria-label={`Plage ${index + 1} : début`}
            value={slot.start}
            onChange={(e) => update(index, { start: e.target.value })}
            className={`${INPUT} text-center`}
          />
          <input
            type="time"
            aria-label={`Plage ${index + 1} : fin`}
            value={slot.end}
            onChange={(e) => update(index, { end: e.target.value })}
            className={`${INPUT} text-center`}
          />
          <button
            type="button"
            aria-label={`Retirer la plage ${index + 1}`}
            onClick={() => onChange(slots.filter((_, i) => i !== index))}
            className="press grid size-10 place-items-center rounded-full bg-white/8 text-text-2"
          >
            <CloseIcon size={18} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...slots, nextSlot(slots)])}
        className="press flex h-11 items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 text-[15px] text-accent"
      >
        <PlusIcon size={18} />
        {slots.length ? 'Ajouter une plage (coupure)' : 'Ajouter une plage horaire'}
      </button>
    </div>
  )
}

interface HoursInputProps {
  label: string
  value: number | null
  onCommit: (value: number | null) => void
  placeholder?: string
  className?: string
}

export function HoursInput({ label, value, onCommit, placeholder = '0', className = '' }: HoursInputProps) {
  const [draft, setDraft] = useState<string | null>(null)

  const commit = () => {
    if (draft === null) return
    const next = parseHours(draft)
    if (draft.trim() === '' || next !== null) onCommit(next === null ? null : Math.round(next * 100) / 100)
    setDraft(null)
  }

  return (
    <span className={`flex items-center gap-1.5 ${className}`}>
      <input
        aria-label={label}
        inputMode="decimal"
        enterKeyHint="done"
        placeholder={placeholder}
        value={draft ?? formatHoursInput(value)}
        onFocus={(e) => {
          setDraft(formatHoursInput(value))
          requestAnimationFrame(() => e.target.select())
        }}
        onChange={(e) => setDraft(e.target.value.slice(0, 9))}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        className="h-10 w-20 rounded-xl border border-line bg-black/30 px-2.5 text-right text-[17px] font-semibold tabular-nums outline-none placeholder:font-normal placeholder:text-text-2 focus:border-white/25"
      />
      <span className="text-[15px] text-text-2">h</span>
    </span>
  )
}
