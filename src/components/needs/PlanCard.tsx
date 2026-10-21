import { MACROS } from '../../config/macros'
import { formatInt } from '../../lib/format'
import { FIBER_GRAMS, waterLitres, type Direction, type Plan, type Sex } from '../../lib/needs'
import { saveSettings, type Profile } from '../../lib/profiles'
import { useAppStore } from '../../store/appStore'
import { SettingsGroup, SettingsRow } from '../settings/SettingsGroup'

const PROTEIN_NOTE: Record<Direction, string> = {
  lose: '2 g par kg pour garder ton muscle pendant la perte',
  keep: '1,6 g par kg',
  gain: '1,8 g par kg pour construire du muscle',
}

const litres = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 })

interface Props {
  me: Profile
  plan: Plan
  sex: Sex
  direction: Direction
}

export function PlanCard({ me, plan, sex, direction }: Props) {
  const kcal = Math.min(6000, Math.max(800, plan.kcal))
  const macros = { carbs: plan.carbs, fat: plan.fat, protein: plan.protein }
  const applied =
    me.dailyKcalGoal === kcal && me.macroMode === 'manual' && MACROS.every(({ key }) => me.macroGoals[key] === macros[key])

  const apply = () => {
    saveSettings(me.uid, { dailyKcalGoal: kcal, macroMode: 'manual', macroGoals: macros })
    useAppStore.getState().showToast(`Objectif mis à jour : ${formatInt(kcal)} kcal`)
  }

  return (
    <div>
      <SettingsGroup
        title="Ta répartition par jour"
        footer={`Protéines : ${PROTEIN_NOTE[direction]} (poids ajusté en cas de surpoids). Lipides : 30 % des calories. Glucides : le reste.`}
      >
        <SettingsRow>
          <span className="flex-1 text-[17px]">Calories</span>
          <span className="text-[17px] font-semibold tabular-nums">
            {formatInt(kcal)}
            <span className="ml-1.5 text-[15px] font-normal text-text-2">kcal</span>
          </span>
        </SettingsRow>
        {MACROS.map((meta) => (
          <SettingsRow key={meta.key}>
            <span className="size-2.5 rounded-full" style={{ background: meta.colorB }} />
            <span className="flex-1 text-[17px]">{meta.label}</span>
            <span className="text-[13px] text-text-2 tabular-nums">
              {Math.round(((macros[meta.key] * (meta.key === 'fat' ? 9 : 4)) / kcal) * 100)} %
            </span>
            <span className="w-16 text-right text-[17px] font-semibold tabular-nums">
              {formatInt(macros[meta.key])}
              <span className="ml-1 text-[15px] font-normal text-text-2">g</span>
            </span>
          </SettingsRow>
        ))}
        <SettingsRow>
          <span className="flex-1 text-[17px]">Fibres</span>
          <span className="text-[17px] font-semibold tabular-nums">
            {FIBER_GRAMS}
            <span className="ml-1 text-[15px] font-normal text-text-2">g et plus</span>
          </span>
        </SettingsRow>
        <SettingsRow>
          <span className="flex-1 text-[17px]">Eau à boire</span>
          <span className="text-right text-[17px] font-semibold tabular-nums">
            {litres.format(waterLitres(sex))} L
            <span className="block text-[12px] font-normal text-text-2">+ 0,5 L par heure de sport</span>
          </span>
        </SettingsRow>
      </SettingsGroup>
      <button
        type="button"
        disabled={applied}
        onClick={apply}
        className="press mt-4 h-13 w-full rounded-full bg-accent text-[16px] font-semibold text-black shadow-accent disabled:bg-surface-2 disabled:text-text-2 disabled:shadow-none"
      >
        {applied ? 'C’est déjà ton objectif' : 'Utiliser comme objectif'}
      </button>
      <p className="mt-2 px-1 text-center text-[13px] leading-snug text-text-2">
        {applied
          ? 'Ton anneau du jour et tes macros suivent ce calcul.'
          : `Remplace ton objectif actuel (${formatInt(me.dailyKcalGoal)} kcal) et passe tes macros en mode Manuel.`}
      </p>
    </div>
  )
}
