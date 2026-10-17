import { COLORS, type ColorId } from '../config/colors'
import { ProfileOrb } from './ProfileOrb'

interface Props {
  value: ColorId
  onChange: (id: ColorId) => void
  taken?: ColorId[]
}

export function ColorPicker({ value, onChange, taken = [] }: Props) {
  return (
    <div role="radiogroup" aria-label="Couleur" className="flex justify-between">
      {COLORS.map((color) => {
        const used = taken.includes(color.id)
        return (
          <button
            key={color.id}
            type="button"
            role="radio"
            aria-checked={color.id === value}
            aria-label={used ? `${color.label}, déjà prise` : color.label}
            disabled={used}
            onClick={() => onChange(color.id)}
            className={`grid size-12 place-items-center rounded-full border-2 transition-colors disabled:opacity-25 ${
              color.id === value ? 'border-white/80' : 'border-transparent'
            }`}
          >
            <ProfileOrb profile={color} size={32} />
          </button>
        )
      })}
    </div>
  )
}
