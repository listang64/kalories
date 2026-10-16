import { useState } from 'react'
import { BottomSheet } from '../components/BottomSheet'
import { AddButton } from '../components/home/AddButton'
import { CalorieLegend } from '../components/home/CalorieLegend'
import { CalorieRing, type PersonEntry } from '../components/home/CalorieRing'
import { GeminiBanner } from '../components/home/GeminiBanner'
import { HomeHeader } from '../components/home/HomeHeader'
import { MacroBlock } from '../components/home/MacroBlock'
import { otherProfile, PROFILES, type Profile } from '../config/users'
import { useHomeData } from '../hooks/useHomeData'
import { useProfiles } from '../hooks/useProfiles'
import { useToday } from '../hooks/useToday'
import { useLocalSettings } from '../lib/localSettings'
import { useAppStore } from '../store/appStore'
import { SettingsScreen } from './SettingsScreen'

export function HomeScreen({ profile }: { profile: Profile }) {
  const today = useToday()
  const data = useHomeData(useProfiles())
  const hasKey = useLocalSettings((s) => s.geminiKey !== '')
  const [viewed, setViewed] = useState(profile)
  const overlay = useAppStore((s) => s.overlay)
  const setOverlay = useAppStore((s) => s.setOverlay)
  const showToast = useAppStore((s) => s.showToast)

  const soon = () => showToast('Bientôt disponible')
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
        <CalorieRing left={nico} right={chachou} onOrb={soon} />
      </div>
      <CalorieLegend entries={[nico, chachou]} />
      <div className="flex justify-center pt-4 pb-3">
        <AddButton onPress={soon} />
      </div>
      <BottomSheet open={overlay === 'settings'} title="Paramètres" onClose={() => setOverlay(null)}>
        <SettingsScreen profile={profile} />
      </BottomSheet>
    </main>
  )
}
