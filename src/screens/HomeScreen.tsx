import { useState } from 'react'
import { AddMealSheet } from '../components/AddMealSheet'
import { BottomSheet } from '../components/BottomSheet'
import { CalorieLegend } from '../components/home/CalorieLegend'
import { MealOfferDialog } from '../components/day/MealOfferDialog'
import { CalorieRing } from '../components/home/CalorieRing'
import { GeminiBanner } from '../components/home/GeminiBanner'
import { InstallBanner } from '../components/InstallBanner'
import { HomeActions } from '../components/home/HomeActions'
import { HomeHeader } from '../components/home/HomeHeader'
import { MacroBlock } from '../components/home/MacroBlock'
import { RecipesSheet } from '../components/recipes/RecipesSheet'
import { Rise } from '../components/Rise'
import { BarcodeScanner } from '../components/scanner/BarcodeScanner'
import { SortButton } from '../components/shopping/SortButton'
import { personEntry } from '../hooks/useHomeData'
import { useMeals } from '../hooks/useMeals'
import { useShoppingList } from '../hooks/useShoppingList'
import { useToday } from '../hooks/useToday'
import { useLocalSettings } from '../lib/localSettings'
import type { MealItem } from '../lib/nutrition'
import type { Profile } from '../lib/profiles'
import { useAppStore } from '../store/appStore'
import { DayDetailScreen } from './DayDetailScreen'
import { HistoryScreen } from './HistoryScreen'
import { LoansScreen } from './LoansScreen'
import { SettingsScreen } from './SettingsScreen'
import { ShoppingScreen } from './ShoppingScreen'

interface Props {
  me: Profile
  people: Profile[]
}

export function HomeScreen({ me, people }: Props) {
  const today = useToday()
  const meals = useMeals(people.map((person) => person.uid), today)
  const hasKey = useLocalSettings((s) => s.geminiKey !== '')
  const shopping = useShoppingList()
  const [viewedUid, setViewedUid] = useState(me.uid)
  const [scanning, setScanning] = useState(false)
  const overlay = useAppStore((s) => s.overlay)
  const setOverlay = useAppStore((s) => s.setOverlay)
  const openAdd = useAppStore((s) => s.openAdd)
  const settingsOnTop = useAppStore((s) => s.settingsOnTop)
  const closeSettings = useAppStore((s) => s.closeSettings)

  const mine = personEntry(me, meals)
  const entries = people.map((person) => personEntry(person, meals))
  const partner = people.find((person) => person.uid !== me.uid) ?? null
  const viewed = entries.find((entry) => entry.profile.uid === viewedUid) ?? mine
  const next = entries[(entries.indexOf(viewed) + 1) % entries.length]

  const addScanned = (item: MealItem) => {
    setScanning(false)
    openAdd()
    const { appendItems, setAddStep } = useAppStore.getState()
    appendItems([item])
    setAddStep('review')
  }

  return (
    <main className="safe-screen flex h-full flex-col px-5">
      <Rise index={0}>
        <HomeHeader dateKey={today} onOpen={setOverlay} />
        <InstallBanner />
        {!hasKey && <GeminiBanner onPress={() => setOverlay('settings')} />}
      </Rise>
      <Rise index={1} className="mt-5">
        <MacroBlock
          entry={viewed}
          onToggle={next && next !== viewed ? () => setViewedUid(next.profile.uid) : undefined}
        />
      </Rise>
      <Rise index={2} className="my-3 flex min-h-0 flex-1">
        <CalorieRing left={entries[0] ?? mine} right={entries[1] ?? null} onOrb={() => setOverlay('day')} />
      </Rise>
      <Rise index={3}>
        <CalorieLegend entries={entries} />
      </Rise>
      <Rise index={4} className="pt-4 pb-3">
        <HomeActions
          shoppingCount={shopping.items.length}
          onScan={() => setScanning(true)}
          onAdd={() => openAdd()}
          onShopping={() => setOverlay('shopping')}
        />
      </Rise>
      <BottomSheet open={overlay === 'day'} title="Journée" onClose={() => setOverlay(null)}>
        <DayDetailScreen me={me} people={people} />
      </BottomSheet>
      <BottomSheet open={overlay === 'history'} title="Historique" onClose={() => setOverlay(null)}>
        <HistoryScreen me={me} people={people} />
      </BottomSheet>
      <BottomSheet
        open={overlay === 'shopping'}
        title="Liste de courses"
        onClose={() => setOverlay(null)}
        action={<SortButton items={shopping.items} />}
      >
        <ShoppingScreen me={me} partner={partner} items={shopping.items} denied={shopping.denied} />
      </BottomSheet>
      <BottomSheet open={overlay === 'loans'} title="Prêts" onClose={() => setOverlay(null)}>
        <LoansScreen me={me} partner={partner} />
      </BottomSheet>
      <RecipesSheet me={me} partner={partner} />
      <AddMealSheet me={me} progress={{ kcal: mine.day.totals.kcal, goal: mine.day.goals.kcal }} />
      <BottomSheet open={overlay === 'settings' || settingsOnTop} title="Paramètres" onClose={closeSettings}>
        <SettingsScreen me={me} people={people} />
      </BottomSheet>
      <MealOfferDialog uid={me.uid} />
      <BarcodeScanner open={scanning} onClose={() => setScanning(false)} onAdd={addScanned} />
    </main>
  )
}
