import { useEffect, useState } from 'react'
import { doc, onSnapshot, setDoc, type DocumentData } from 'firebase/firestore'
import { db } from '../config/firebase'
import { PROFILE_LIST, PROFILES, type Profile, type ProfileId } from '../config/users'
import { autoMacroGoals, type DayGoals, type Macros } from '../lib/nutrition'
import { useAppStore } from '../store/appStore'

export type MacroMode = 'auto' | 'manual'

export interface UserSettings {
  name: string
  color: Profile['color']
  dailyKcalGoal: number
  macroMode: MacroMode
  macroGoals: Macros
}

export type ProfilesSettings = Record<ProfileId, UserSettings>

const DEFAULT_KCAL: Record<ProfileId, number> = { nico: 2200, chachou: 1800 }

function defaultSettings(profile: Profile): UserSettings {
  const kcal = DEFAULT_KCAL[profile.id]
  return {
    name: profile.name,
    color: profile.color,
    dailyKcalGoal: kcal,
    macroMode: 'auto',
    macroGoals: autoMacroGoals(kcal),
  }
}

function positive(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : undefined
}

function parse(profile: Profile, data: DocumentData | undefined): UserSettings {
  const base = defaultSettings(profile)
  if (!data) return base
  const kcal = positive(data.dailyKcalGoal) || base.dailyKcalGoal
  const macros = (data.macroGoals ?? {}) as Record<string, unknown>
  const auto = autoMacroGoals(kcal)
  return {
    ...base,
    dailyKcalGoal: kcal,
    macroMode: data.macroMode === 'manual' ? 'manual' : 'auto',
    macroGoals: {
      carbs: positive(macros.carbs) ?? auto.carbs,
      fat: positive(macros.fat) ?? auto.fat,
      protein: positive(macros.protein) ?? auto.protein,
    },
  }
}

export function goalsOf(settings: UserSettings): DayGoals {
  const macros = settings.macroMode === 'auto' ? autoMacroGoals(settings.dailyKcalGoal) : settings.macroGoals
  return { kcal: settings.dailyKcalGoal, ...macros }
}

export function saveSettings(profile: Profile, patch: Partial<UserSettings>) {
  setDoc(doc(db, 'users', profile.uid), { name: profile.name, color: profile.color, ...patch }, { merge: true }).catch(
    () => useAppStore.getState().showToast('Enregistrement impossible'),
  )
}

export function useProfiles(): ProfilesSettings {
  const [settings, setSettings] = useState<ProfilesSettings>(() => ({
    nico: defaultSettings(PROFILES.nico),
    chachou: defaultSettings(PROFILES.chachou),
  }))

  useEffect(() => {
    const unsubscribers = PROFILE_LIST.map((profile) =>
      onSnapshot(
        doc(db, 'users', profile.uid),
        (snapshot) => setSettings((current) => ({ ...current, [profile.id]: parse(profile, snapshot.data()) })),
        () => undefined,
      ),
    )
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe())
  }, [])

  return settings
}
