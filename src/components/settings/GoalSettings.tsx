import { formatInt } from '../../lib/format'
import { saveSettings, type Profile } from '../../lib/profiles'
import { NumberField } from '../NumberField'
import { ProfileOrb } from '../ProfileOrb'
import { SettingsGroup, SettingsRow } from './SettingsGroup'

interface Props {
  me: Profile
  partner: Profile | null
}

export function GoalSettings({ me, partner }: Props) {
  return (
    <SettingsGroup
      title="Objectif calorique"
      footer={partner ? `Chacun règle le sien : l’objectif de ${partner.name} se change sur son téléphone.` : undefined}
    >
      <SettingsRow>
        <ProfileOrb profile={me} size={20} />
        <span className="flex-1 text-[17px]">{me.name}</span>
        <NumberField
          label={`Objectif calorique de ${me.name}`}
          value={me.dailyKcalGoal}
          min={800}
          max={6000}
          suffix="kcal"
          onCommit={(dailyKcalGoal) => saveSettings(me.uid, { dailyKcalGoal })}
        />
      </SettingsRow>
      {partner && (
        <SettingsRow>
          <ProfileOrb profile={partner} size={20} />
          <span className="flex-1 text-[17px] text-text-2">{partner.name}</span>
          <span className="text-[17px] font-semibold text-text-2 tabular-nums">
            {formatInt(partner.dailyKcalGoal)}
            <span className="ml-1.5 text-[15px] font-normal">kcal</span>
          </span>
        </SettingsRow>
      )}
    </SettingsGroup>
  )
}
