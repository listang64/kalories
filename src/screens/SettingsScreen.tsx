import { AppSettings } from '../components/settings/AppSettings'
import { GeminiSettings } from '../components/settings/GeminiSettings'
import { GoalSettings } from '../components/settings/GoalSettings'
import { MacroSettings } from '../components/settings/MacroSettings'
import type { Profile } from '../config/users'
import { useProfiles } from '../hooks/useProfiles'

export function SettingsScreen({ profile }: { profile: Profile }) {
  const settings = useProfiles()

  return (
    <div className="flex flex-col gap-7 pt-1">
      <GoalSettings profile={profile} settings={settings} />
      <MacroSettings profile={profile} settings={settings[profile.id]} />
      <GeminiSettings />
      <AppSettings profile={profile} />
    </div>
  )
}
