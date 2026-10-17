import { AppSettings } from '../components/settings/AppSettings'
import { GeminiSettings } from '../components/settings/GeminiSettings'
import { GoalSettings } from '../components/settings/GoalSettings'
import { MacroSettings } from '../components/settings/MacroSettings'
import type { Profile } from '../lib/profiles'

interface Props {
  me: Profile
  partner: Profile | null
}

export function SettingsScreen({ me, partner }: Props) {
  return (
    <div className="flex flex-col gap-7 pt-1">
      <GoalSettings me={me} partner={partner} />
      <MacroSettings me={me} />
      <GeminiSettings />
      <AppSettings me={me} />
    </div>
  )
}
