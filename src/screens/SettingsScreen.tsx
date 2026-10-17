import { AppSettings } from '../components/settings/AppSettings'
import { GeminiSettings } from '../components/settings/GeminiSettings'
import { GoalSettings } from '../components/settings/GoalSettings'
import { HouseholdSettings } from '../components/settings/HouseholdSettings'
import { MacroSettings } from '../components/settings/MacroSettings'
import { SignupCodes } from '../components/settings/SignupCodes'
import { isAdmin } from '../config/admins'
import type { Profile } from '../lib/profiles'

interface Props {
  me: Profile
  people: Profile[]
}

export function SettingsScreen({ me, people }: Props) {
  const partner = people.find((person) => person.uid !== me.uid) ?? null

  return (
    <div className="flex flex-col gap-7 pt-1">
      <GoalSettings me={me} partner={partner} />
      <MacroSettings me={me} />
      <HouseholdSettings me={me} people={people} />
      <GeminiSettings />
      {isAdmin(me.uid) && <SignupCodes />}
      <AppSettings me={me} partner={partner} />
    </div>
  )
}
