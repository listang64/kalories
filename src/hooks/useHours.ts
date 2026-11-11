import { useEffect, useState } from 'react'
import { onSnapshot } from 'firebase/firestore'
import { emptySettings, isMonthKey, parseMonth, parseSettings, type HoursSettings, type MonthDays } from '../lib/hours/model'
import { hoursOf, SETTINGS_DOC } from '../lib/hours/store'

export interface HoursData {
  loaded: boolean
  denied: boolean
  settings: HoursSettings
  months: Record<string, MonthDays>
}

const EMPTY: HoursData = { loaded: false, denied: false, settings: emptySettings(), months: {} }

export function useHours(uid: string, enabled: boolean): HoursData {
  const [state, setState] = useState<HoursData & { uid: string }>({ ...EMPTY, uid })

  useEffect(() => {
    if (!enabled) return
    return onSnapshot(
      hoursOf(uid),
      (snapshot) => {
        const months: Record<string, MonthDays> = {}
        let settings = emptySettings()
        snapshot.docs.forEach((item) => {
          if (item.id === SETTINGS_DOC) settings = parseSettings(item.data())
          else if (isMonthKey(item.id)) months[item.id] = parseMonth(item.data())
        })
        setState({ uid, loaded: true, denied: false, settings, months })
      },
      (error) => setState((current) => ({ ...current, uid, loaded: true, denied: error.code === 'permission-denied' })),
    )
  }, [uid, enabled])

  return state.uid === uid ? state : EMPTY
}
