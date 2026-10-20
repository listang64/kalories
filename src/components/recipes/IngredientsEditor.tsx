import { emptyIngredient, type DraftIngredient, type DraftRow } from '../../lib/recipeDraft'
import { RECIPE_LIMITS } from '../../lib/recipes'
import { CloseIcon } from '../icons/CloseIcon'
import { GroupedEditor, ICON_BUTTON, onEnter, type ItemControls } from './GroupedEditor'

interface Props {
  ingredients: DraftRow<DraftIngredient>[]
  onChange: (ingredients: DraftRow<DraftIngredient>[]) => void
}

const INPUT =
  'h-11 rounded-xl border border-line bg-black/30 px-3 text-base outline-none placeholder:text-white/25 focus:border-white/20'

export function IngredientsEditor({ ingredients, onChange }: Props) {
  return (
    <GroupedEditor
      rows={ingredients}
      onChange={onChange}
      empty={emptyIngredient}
      isBlank={(row) => !row.name.trim() && !row.quantity.trim()}
      limit={RECIPE_LIMITS.ingredients}
      noun="un ingrédient"
      addLabel="Ingrédient"
      groupNoun="groupe d’ingrédients"
      renderItem={(row, controls) => <IngredientRow row={row} {...controls} />}
    />
  )
}

function IngredientRow({ row, number, focus, onChange, onRemove, onNext }: ItemControls<DraftIngredient> & { row: DraftIngredient }) {
  return (
    <>
      <input
        aria-label={`Quantité de l’ingrédient ${number}`}
        value={row.quantity}
        onChange={(e) => onChange({ ...row, quantity: e.target.value.slice(0, RECIPE_LIMITS.quantity) })}
        placeholder="200 g"
        autoFocus={focus}
        enterKeyHint="next"
        className={`${INPUT} w-[5.5rem] shrink-0`}
      />
      <input
        aria-label={`Ingrédient ${number}`}
        value={row.name}
        onChange={(e) => onChange({ ...row, name: e.target.value.slice(0, RECIPE_LIMITS.ingredient) })}
        onKeyDown={onEnter(onNext)}
        placeholder="Farine"
        enterKeyHint="next"
        autoCapitalize="sentences"
        className={`${INPUT} min-w-0 flex-1`}
      />
      <button type="button" aria-label={`Retirer l’ingrédient ${number}`} onClick={onRemove} className={`${ICON_BUTTON} mt-1`}>
        <CloseIcon size={18} />
      </button>
    </>
  )
}
