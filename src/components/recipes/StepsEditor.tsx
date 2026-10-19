import { useLayoutEffect, useRef, useState } from 'react'
import { draftKey, type DraftStep } from '../../lib/recipeDraft'
import { RECIPE_LIMITS } from '../../lib/recipes'
import { CloseIcon } from '../icons/CloseIcon'
import { PlusIcon } from '../icons/PlusIcon'

interface Props {
  steps: DraftStep[]
  onChange: (steps: DraftStep[]) => void
}

export function StepsEditor({ steps, onChange }: Props) {
  const [added, setAdded] = useState<string | null>(null)

  const add = () => {
    if (steps.length >= RECIPE_LIMITS.steps) return
    const step = { key: draftKey(), text: '' }
    setAdded(step.key)
    onChange([...steps, step])
  }

  return (
    <div className="flex flex-col gap-2">
      <ol className="flex flex-col gap-2">
        {steps.map((step, index) => (
          <li key={step.key} className="flex items-start gap-2">
            <span className="mt-2.5 grid size-7 shrink-0 place-items-center rounded-full bg-accent/15 text-[14px] font-semibold text-accent tabular-nums">
              {index + 1}
            </span>
            <StepInput
              label={`Étape ${index + 1}`}
              value={step.text}
              focus={step.key === added}
              onChange={(text) => onChange(steps.map((item) => (item.key === step.key ? { ...item, text } : item)))}
            />
            <button
              type="button"
              aria-label={`Retirer l’étape ${index + 1}`}
              onClick={() => onChange(steps.filter((item) => item.key !== step.key))}
              className="mt-1 grid size-9 shrink-0 place-items-center rounded-full text-text-2 active:bg-white/8"
            >
              <CloseIcon size={18} />
            </button>
          </li>
        ))}
      </ol>
      <button
        type="button"
        onClick={add}
        className="press flex h-11 items-center justify-center gap-1.5 rounded-full border border-dashed border-white/15 text-[15px] font-medium text-accent"
      >
        <PlusIcon size={18} strokeWidth={2} />
        Ajouter une étape
      </button>
    </div>
  )
}

interface StepInputProps {
  label: string
  value: string
  focus: boolean
  onChange: (text: string) => void
}

function StepInput({ label, value, focus, onChange }: StepInputProps) {
  const ref = useRef<HTMLTextAreaElement>(null)

  useLayoutEffect(() => {
    const area = ref.current
    if (!area) return
    area.style.height = 'auto'
    area.style.height = `${area.scrollHeight + 2}px`
  }, [value])

  return (
    <textarea
      ref={ref}
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value.slice(0, RECIPE_LIMITS.step))}
      placeholder="Décris l’étape…"
      autoFocus={focus}
      rows={1}
      className="min-h-11 min-w-0 flex-1 resize-none overflow-hidden rounded-xl border border-line bg-black/30 px-3 py-2.5 text-base leading-snug outline-none placeholder:text-white/25 focus:border-white/20"
    />
  )
}
