import { useEffect, useRef, type PointerEvent } from 'react'
import { Icon } from './icons/Icon'
import { NumberField } from './NumberField'

interface Props {
  label: string
  value: number
  onChange: (value: number) => void
  step?: number
  min?: number
  max?: number
}

const HOLD_DELAY = 400

export function Stepper({ label, value, onChange, step = 10, min = 0, max = 5000 }: Props) {
  const latest = useRef({ value, onChange })
  latest.current = { value, onChange }
  const timer = useRef(0)

  const stop = () => window.clearTimeout(timer.current)
  useEffect(() => stop, [])

  const nudge = (direction: 1 | -1, size: number) => {
    const current = latest.current.value
    const next = direction > 0 ? Math.floor(current / size) * size + size : Math.ceil(current / size) * size - size
    latest.current.onChange(Math.min(max, Math.max(min, next)))
  }

  const press = (direction: 1 | -1) => (event: PointerEvent) => {
    event.preventDefault()
    event.stopPropagation()
    stop()
    nudge(direction, step)
    let count = 0
    const repeat = () => {
      count += 1
      nudge(direction, count > 12 ? step * 5 : step)
      timer.current = window.setTimeout(repeat, count > 5 ? 60 : 120)
    }
    timer.current = window.setTimeout(repeat, HOLD_DELAY)
  }

  const button = (direction: 1 | -1) => (
    <button
      type="button"
      aria-label={direction > 0 ? `Ajouter ${step} g` : `Retirer ${step} g`}
      onPointerDown={press(direction)}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      onContextMenu={(e) => e.preventDefault()}
      onKeyDown={(e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return
        e.preventDefault()
        nudge(direction, step)
      }}
      className="grid size-10 place-items-center rounded-full bg-white/8 text-text transition-colors active:bg-white/18"
    >
      <Icon size={20} strokeWidth={1.75}>
        <path d={direction > 0 ? 'M12 5v14M5 12h14' : 'M5 12h14'} />
      </Icon>
    </button>
  )

  return (
    <div className="flex items-center gap-1.5">
      {button(-1)}
      <NumberField
        label={label}
        value={value}
        suffix="g"
        min={min}
        max={max}
        onCommit={onChange}
        inputClassName="w-16 rounded-[10px] bg-white/8 py-1.5 text-center focus:bg-white/12"
      />
      {button(1)}
    </div>
  )
}
