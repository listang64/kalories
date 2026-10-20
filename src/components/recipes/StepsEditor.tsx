import { useLayoutEffect, useRef } from 'react'
import { emptyStep, type DraftRow, type DraftStep } from '../../lib/recipeDraft'
import { RECIPE_LIMITS } from '../../lib/recipes'
import { CloseIcon } from '../icons/CloseIcon'
import { GroupedEditor, ICON_BUTTON, MoveArrows, type ItemControls } from './GroupedEditor'

interface Props {
  steps: DraftRow<DraftStep>[]
  onChange: (steps: DraftRow<DraftStep>[]) => void
}

export function StepsEditor({ steps, onChange }: Props) {
  return (
    <GroupedEditor
      rows={steps}
      onChange={onChange}
      empty={emptyStep}
      isBlank={(row) => !row.text.trim()}
      limit={RECIPE_LIMITS.steps}
      noun="une étape"
      addLabel="Étape"
      groupNoun="groupe d’étapes"
      renderItem={(row, controls) => <StepRow row={row} {...controls} />}
    />
  )
}

function StepRow(props: ItemControls<DraftStep> & { row: DraftStep }) {
  const { row, number, focus, first, last, onChange, onMove, onRemove } = props
  return (
    <>
      <span className="mt-2 flex shrink-0 flex-col items-center gap-1">
        <span className="grid size-7 place-items-center rounded-full bg-accent/15 text-[14px] font-semibold text-accent tabular-nums">
          {number}
        </span>
        <MoveArrows label={`l’étape ${number}`} first={first} last={last} onMove={onMove} />
      </span>
      <StepInput
        label={`Étape ${number}`}
        value={row.text}
        focus={focus}
        onChange={(text) => onChange({ ...row, text })}
      />
      <button type="button" aria-label={`Retirer l’étape ${number}`} onClick={onRemove} className={`${ICON_BUTTON} mt-1`}>
        <CloseIcon size={18} />
      </button>
    </>
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
