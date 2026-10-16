import { useId } from 'react'
import { motion } from 'motion/react'

interface Option<T extends string> {
  value: T
  label: string
}

interface Props<T extends string> {
  label: string
  value: T
  options: Option<T>[]
  onChange: (value: T) => void
}

export function Segmented<T extends string>({ label, value, options, onChange }: Props<T>) {
  const id = useId()

  return (
    <div role="radiogroup" aria-label={label} className="grid w-full auto-cols-fr grid-flow-col rounded-full bg-black/40 p-1">
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={`relative h-9 rounded-full text-[15px] font-medium transition-colors ${active ? 'text-text' : 'text-text-2'}`}
          >
            {active && (
              <motion.span
                layoutId={id}
                className="absolute inset-0 rounded-full bg-white/14"
                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
              />
            )}
            <span className="relative">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}
