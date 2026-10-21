import type { NeedsForm } from '../../hooks/useNeedsForm'
import { LIFESTYLES } from '../../lib/needs'
import { ValueField } from '../ValueField'
import { ChoiceCard } from './ChoiceCard'
import { NeedsSection } from './NeedsSection'

interface Props {
  form: NeedsForm
  onChange: (patch: Partial<NeedsForm>) => void
}

export function DayFields({ form, onChange }: Props) {
  return (
    <NeedsSection
      title="Ta journée, hors sport"
      footer="Pas : la moyenne de la semaine dans Santé, Samsung Health ou Google Fit. Sans podomètre, compte 3 000 si tu bouges peu, 7 000 en moyenne, 12 000 si tu marches beaucoup."
    >
      <div role="radiogroup" aria-label="Activité de la journée" className="flex flex-col gap-2">
        {LIFESTYLES.map((option) => (
          <ChoiceCard
            key={option.value}
            active={form.lifestyle === option.value}
            onSelect={() => onChange({ lifestyle: option.value })}
          >
            <span className="block text-[16px] font-semibold">{option.label}</span>
            <span className="mt-0.5 block text-[13px] text-text-2">{option.detail}</span>
          </ChoiceCard>
        ))}
      </div>
      <div className="mt-2">
        <ValueField
          label="Pas par jour, en moyenne"
          unit="pas"
          value={form.steps}
          decimals={false}
          digits={5}
          onChange={(steps) => onChange({ steps })}
        />
      </div>
    </NeedsSection>
  )
}
