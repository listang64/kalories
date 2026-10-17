import { MACROS } from '../../config/macros'
import { formatInt } from '../../lib/format'
import { goalsOf, saveSettings, type MacroMode, type Profile } from '../../lib/profiles'
import { NumberField } from '../NumberField'
import { Segmented } from '../Segmented'
import { SettingsGroup, SettingsRow } from './SettingsGroup'


const MODES: { value: MacroMode; label: string }[] = [
  { value: 'auto', label: 'Auto' },
  { value: 'manual', label: 'Manuel' },
]

export function MacroSettings({ me }: { me: Profile }) {
  const goals = goalsOf(me)
  const macros = { carbs: goals.carbs, fat: goals.fat, protein: goals.protein }
  const manual = me.macroMode === 'manual'
  const macroKcal = goals.carbs * 4 + goals.fat * 9 + goals.protein * 4

  const setMode = (mode: MacroMode) =>
    saveSettings(me.uid, mode === 'manual' ? { macroMode: mode, macroGoals: macros } : { macroMode: mode })

  return (
    <SettingsGroup
      title="Objectifs macros"
      footer={
        manual
          ? `Ces grammes représentent environ ${formatInt(macroKcal)} kcal.`
          : 'Auto : 50 % glucides, 30 % lipides, 20 % protéines de ton objectif calorique.'
      }
    >
      <SettingsRow>
        <Segmented label="Mode des macros" value={me.macroMode} options={MODES} onChange={setMode} />
      </SettingsRow>
      {MACROS.map((meta) => (
        <SettingsRow key={meta.key}>
          <span className="size-2.5 rounded-full" style={{ background: meta.colorB }} />
          <span className="flex-1 text-[17px]">{meta.label}</span>
          {manual ? (
            <NumberField
              label={`Objectif ${meta.label.toLowerCase()} en grammes`}
              value={goals[meta.key]}
              min={0}
              max={1500}
              suffix="g"
              onCommit={(grams) => saveSettings(me.uid, { macroGoals: { ...macros, [meta.key]: grams } })}
            />
          ) : (
            <span className="text-[17px] font-semibold text-text-2 tabular-nums">
              {formatInt(goals[meta.key])}
              <span className="ml-1.5 text-[15px] font-normal">g</span>
            </span>
          )}
        </SettingsRow>
      ))}
    </SettingsGroup>
  )
}
