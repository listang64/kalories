import { useState } from 'react'
import { formatInt } from '../lib/format'

interface Props {
  label: string
  value: number
  suffix: string
  min: number
  max: number
  onCommit: (value: number) => void
}

export function NumberField({ label, value, suffix, min, max, onCommit }: Props) {
  const [draft, setDraft] = useState<string | null>(null)

  const commit = () => {
    if (draft === null) return
    const next = Number(draft)
    if (draft !== '' && next >= min && next <= max && next !== value) onCommit(next)
    setDraft(null)
  }

  return (
    <span className="flex items-baseline gap-1.5">
      <input
        aria-label={label}
        inputMode="numeric"
        pattern="[0-9]*"
        enterKeyHint="done"
        value={draft ?? formatInt(value)}
        onFocus={(e) => {
          setDraft(String(value))
          requestAnimationFrame(() => e.target.select())
        }}
        onChange={(e) => setDraft(e.target.value.replace(/\D/g, '').slice(0, 5))}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        className="w-20 bg-transparent text-right text-[17px] font-semibold tabular-nums outline-none"
      />
      <span className="text-[15px] text-text-2">{suffix}</span>
    </span>
  )
}
