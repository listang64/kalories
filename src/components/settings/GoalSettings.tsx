import { otherProfile, type Profile } from '../../config/users'
import { saveSettings, type ProfilesSettings } from '../../hooks/useProfiles'
import { formatInt } from '../../lib/format'
import { NumberField } from '../NumberField'
import { ProfileOrb } from '../ProfileOrb'
import { SettingsGroup, SettingsRow } from './SettingsGroup'

interface Props {
  profile: Profile
  settings: ProfilesSettings
}

export function GoalSettings({ profile, settings }: Props) {
  const other = otherProfile(profile)

  return (
    <SettingsGroup
      title="Objectif calorique"
      footer={`Chacun règle le sien : l’objectif de ${other.name} se change sur son téléphone.`}
    >
      <SettingsRow>
        <ProfileOrb profile={profile} size={20} />
        <span className="flex-1 text-[17px]">{profile.name}</span>
        <NumberField
          label={`Objectif calorique de ${profile.name}`}
          value={settings[profile.id].dailyKcalGoal}
          min={800}
          max={6000}
          suffix="kcal"
          onCommit={(dailyKcalGoal) => saveSettings(profile, { dailyKcalGoal })}
        />
      </SettingsRow>
      <SettingsRow>
        <ProfileOrb profile={other} size={20} />
        <span className="flex-1 text-[17px] text-text-2">{other.name}</span>
        <span className="text-[17px] font-semibold text-text-2 tabular-nums">
          {formatInt(settings[other.id].dailyKcalGoal)}
          <span className="ml-1.5 text-[15px] font-normal">kcal</span>
        </span>
      </SettingsRow>
    </SettingsGroup>
  )
}
