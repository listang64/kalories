import { doc, updateDoc, type DocumentData } from 'firebase/firestore'
import { colorById, type ColorId } from '../config/colors'
import { db } from '../config/firebase'
import { useAppStore } from '../store/appStore'
import { autoMacroGoals, type DayGoals, type Macros } from './nutrition'

export type MacroMode = 'auto' | 'manual'

export interface Settings {
  dailyKcalGoal: number
  macroMode: MacroMode
  macroGoals: Macros
}

export interface Profile extends Settings {
  uid: string
  name: string
  color: ColorId
  colorA: string
  colorB: string
  chartColor: string
  householdId: string | null
}

export const DEFAULT_KCAL = 2000

function positive(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : undefined
}

export function parseProfile(uid: string, data: DocumentData | undefined): Profile {
  const { id, colorA, colorB, chartColor } = colorById(data?.color)
  const kcal = positive(data?.dailyKcalGoal) || DEFAULT_KCAL
  const macros = (data?.macroGoals ?? {}) as Record<string, unknown>
  const auto = autoMacroGoals(kcal)
  return {
    uid,
    name: typeof data?.name === 'string' && data.name.trim() ? data.name.trim() : 'Sans nom',
    color: id,
    colorA,
    colorB,
    chartColor,
    householdId: typeof data?.householdId === 'string' && data.householdId ? data.householdId : null,
    dailyKcalGoal: kcal,
    macroMode: data?.macroMode === 'manual' ? 'manual' : 'auto',
    macroGoals: {
      carbs: positive(macros.carbs) ?? auto.carbs,
      fat: positive(macros.fat) ?? auto.fat,
      protein: positive(macros.protein) ?? auto.protein,
    },
  }
}

export function goalsOf(settings: Settings): DayGoals {
  const macros = settings.macroMode === 'auto' ? autoMacroGoals(settings.dailyKcalGoal) : settings.macroGoals
  return { kcal: settings.dailyKcalGoal, ...macros }
}

export function saveSettings(uid: string, patch: Partial<Settings & { color: ColorId }>) {
  updateDoc(doc(db, 'users', uid), patch).catch(() => useAppStore.getState().showToast('Enregistrement impossible'))
}
