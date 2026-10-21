import type { ReactNode } from 'react'

interface Props {
  active: boolean
  onSelect: () => void
  children: ReactNode
}

export function ChoiceCard({ active, onSelect, children }: Props) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onSelect}
      className={`press w-full rounded-card border bg-surface-2 px-4 py-3 text-left transition-[border-color,box-shadow] ${
        active ? 'border-accent shadow-[0_0_24px_rgba(255,122,26,0.18)]' : 'border-line'
      }`}
    >
      {children}
    </button>
  )
}
