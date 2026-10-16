import { useState } from 'react'
import { AddMealSheet } from '../components/AddMealSheet'
import { BottomSheet } from '../components/BottomSheet'
import { AddButton } from '../components/home/AddButton'
import { CalorieLegend } from '../components/home/CalorieLegend'
import { CalorieRing, type PersonEntry } from '../components/home/CalorieRing'
import { GeminiBanner } from '../components/home/GeminiBanner'
import { HomeHeader } from '../components/home/HomeHeader'
import { MacroBlock } from '../components/home/MacroBlock'
import { otherProfile, PROFILES, type Profile } from '../config/users'
import { useDayMeals } from '../hooks/useDayMeals'
import { useHomeData } from '../hooks/useHomeData'
import { useProfiles } from '../hooks/useProfiles'
import { useToday } from '../hooks/useToday'
import { useLocalSettings } from '../lib/localSettings'
import { useAppStore } from '../store/appStore'
import { DayDetailScreen } from './DayDetailScreen'
import { SettingsScreen } from './SettingsScreen'

export function HomeScreen({ profile }: { profile: Profile }) {
  const today = useToday()
  const data = useHomeData(useProfiles(), useDayMeals(today))
  const hasKey = useLocalSettings((s) => s.geminiKey !== '')
  const [viewed, setViewed] = useState(profile)
  const overlay = useAppStore((s) => s.overlay)
  const setOverlay = useAppStore((s) => s.setOverlay)
  const openAdd = useAppStore((s) => s.openAdd)
  const settingsOnTop = useAppStore((s) => s.settingsOnTop)
  const closeSettings = useAppStore((s) => s.closeSettings)

  const nico: PersonEntry = { profile: PROFILES.nico, day: data.nico }
  const chachou: PersonEntry = { profile: PROFILES.chachou, day: data.chachou }

  return (
    <main className="safe-screen flex h-full flex-col px-5">
      <HomeHeader dateKey={today} onSettings={() => setOverlay('settings')} />
      {!hasKey && <GeminiBanner onPress={() => setOverlay('settings')} />}
      <div className="mt-5">
        <MacroBlock
          profile={viewed}
          day={data[viewed.id]}
          onToggle={() => setViewed(otherProfile(viewed))}
        />
      </div>
      <div className="my-3 flex min-h-0 flex-1">
        <CalorieRing left={nico} right={chachou} onOrb={() => setOverlay('day')} />
      </div>
      <CalorieLegend entries={[nico, chachou]} />
      <div className="flex justify-center pt-4 pb-3">
        <AddButton onPress={() => openAdd()} />
      </div>
      <BottomSheet open={overlay === 'day'} title="Journée" onClose={() => setOverlay(null)}>
        <DayDetailScreen profile={profile} />
      </BottomSheet>
      <AddMealSheet
        profile={profile}
        progress={{ kcal: data[profile.id].totals.kcal, goal: data[profile.id].goals.kcal }}
      />
      <BottomSheet open={overlay === 'settings' || settingsOnTop} title="Paramètres" onClose={closeSettings}>
        <SettingsScreen profile={profile} />
      </BottomSheet>
    </main>
  )
}
