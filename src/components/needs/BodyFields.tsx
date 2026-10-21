import type { NeedsForm } from '../../hooks/useNeedsForm'
import type { Sex } from '../../lib/needs'
import { ValueField } from '../ValueField'
import { NeedsSection } from './NeedsSection'

const SEXES: { value: Sex; label: string }[] = [
  { value: 'female', label: 'Femme' },
  { value: 'male', label: 'Homme' },
]

interface Props {
  form: NeedsForm
  onChange: (patch: Partial<NeedsForm>) => void
}

export function BodyFields({ form, onChange }: Props) {
  return (
    <NeedsSection
      title="Toi"
      footer="Masse grasse : seulement si elle a été mesurée sérieusement (DEXA, pince à plis, diététicien). Les balances grand public se trompent souvent : dans le doute, laisse vide."
    >
      <div role="radiogroup" aria-label="Sexe" className="grid grid-cols-2 gap-2">
        {SEXES.map((option) => {
          const active = form.sex === option.value
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange({ sex: option.value })}
              className={`press h-11 rounded-full border-2 text-[16px] font-semibold transition-colors ${
                active ? 'border-accent bg-accent text-black shadow-accent' : 'border-accent/80 text-accent'
              }`}
            >
              {option.label}
            </button>
          )
        })}
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <ValueField label="Âge" unit="ans" value={form.age} decimals={false} onChange={(age) => onChange({ age })} />
        <ValueField
          label="Taille"
          unit="cm"
          value={form.height}
          decimals={false}
          onChange={(height) => onChange({ height })}
        />
        <ValueField label="Poids" unit="kg" value={form.weight} onChange={(weight) => onChange({ weight })} />
        <ValueField
          label="Masse grasse"
          unit="%"
          value={form.bodyFat}
          digits={2}
          placeholder="—"
          onChange={(bodyFat) => onChange({ bodyFat })}
        />
      </div>
    </NeedsSection>
  )
}
