import type { NeedsForm } from '../../hooks/useNeedsForm'
import { formatInt } from '../../lib/format'
import { DEFAULT_PACE, PACES, planFor, type Body, type Direction, type Energy, type Pace, type Plan } from '../../lib/needs'
import { Segmented } from '../Segmented'
import { ChoiceCard } from './ChoiceCard'
import { NeedsSection } from './NeedsSection'

const DIRECTIONS: { value: Direction; label: string }[] = [
  { value: 'lose', label: 'Perdre' },
  { value: 'keep', label: 'Maintenir' },
  { value: 'gain', label: 'Prendre' },
]

const decimal = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1, minimumFractionDigits: 1 })
const signed = (value: number, text: string) => `${value < 0 ? '−' : '+'}${text}`

function summary(pace: Pace, plan: Plan, direction: Direction): string {
  if (direction === 'keep') return 'Autant que ce que tu dépenses'
  const percent = signed(pace.change, `${Math.round(Math.abs(pace.change) * 100)} %`)
  const kcal = signed(plan.change, `${formatInt(Math.abs(plan.change))} kcal/j`)
  const rate = direction === 'lose' ? `${decimal.format(Math.abs(plan.weekly))} kg/sem.` : `${decimal.format((plan.weekly * 30) / 7)} kg/mois`
  return `${percent} · ${kcal} · ≈\u00a0${signed(plan.change, rate)}`
}

interface Props {
  energy: Energy
  body: Body
  direction: Direction
  pace: Pace
  onChange: (patch: Partial<NeedsForm>) => void
}

export function GoalPicker({ energy, body, direction, pace, onChange }: Props) {
  return (
    <NeedsSection title="Ton objectif">
      <Segmented
        label="Objectif de poids"
        value={direction}
        options={DIRECTIONS}
        onChange={(next) => onChange({ direction: next, pace: DEFAULT_PACE[next] })}
      />
      <div role="radiogroup" aria-label="Intensité de l’objectif" className="mt-2 flex flex-col gap-2">
        {PACES[direction].map((option) => {
          const plan = planFor(energy, body, direction, option)
          return (
            <ChoiceCard key={option.id} active={option.id === pace.id} onSelect={() => onChange({ pace: option.id })}>
              <span className="flex items-start gap-3">
                <span className="min-w-0 flex-1">
                  <span className="block text-[16px] font-semibold">{option.label}</span>
                  <span className="mt-0.5 block text-[13px] text-text-2">{option.detail}</span>
                  <span className="mt-1 block text-[13px] text-text-2 tabular-nums">{summary(option, plan, direction)}</span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block text-[22px] leading-tight font-semibold tabular-nums">{formatInt(plan.kcal)}</span>
                  <span className="block text-[12px] text-text-2">kcal/jour</span>
                </span>
              </span>
              {plan.warning && <span className="mt-2 block text-[13px] leading-snug font-medium text-accent">{plan.warning}</span>}
            </ChoiceCard>
          )
        })}
      </div>
    </NeedsSection>
  )
}
