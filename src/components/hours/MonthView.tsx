import type { HoursData } from '../../hooks/useHours'
import { dayOf, daysOfMonth, monthLabel, templateFor } from '../../lib/hours/model'
import { saveDay } from '../../lib/hours/store'
import { sharedErrorMessage } from '../../lib/shared'
import { useAppStore } from '../../store/appStore'
import { DayRow } from './DayRow'
import { MonthSummary } from './MonthSummary'
import { MonthNav } from './ui'

interface Props {
  uid: string
  data: HoursData
  month: string
  today: string
  onMonth: (delta: number) => void
  onDay: (date: string) => void
  onSettings: () => void
}

export function MonthView({ uid, data, month, today, onMonth, onDay, onSettings }: Props) {
  const days = data.months[month] ?? {}
  const hasWeek = Object.values(data.settings.week).some((day) => day.slots.length > 0)

  const validate = (date: string) => {
    const template = templateFor(data.settings, date)
    if (!template) return
    saveDay(uid, date, { slots: template.slots, meal: template.meal, off: false, note: '' }).catch((error: unknown) =>
      useAppStore.getState().showToast(sharedErrorMessage(error)),
    )
  }

  return (
    <div className="flex flex-col gap-3 pb-2">
      <MonthNav label={monthLabel(month)} onShift={onMonth} />
      <MonthSummary data={data} month={month} today={today} onSettings={onSettings} />
      {!hasWeek && (
        <button type="button" onClick={onSettings} className="press rounded-card border border-dashed border-accent/50 p-3 text-left text-[14px] leading-snug text-text-2">
          <span className="font-semibold text-accent">Astuce :</span> enregistre ta semaine type dans les réglages pour valider une journée
          classique d’une seule coche verte.
        </button>
      )}
      <ul className="flex flex-col gap-2">
        {daysOfMonth(month).map((date) => (
          <DayRow
            key={date}
            date={date}
            today={today}
            entry={days[dayOf(date)]}
            template={templateFor(data.settings, date)}
            onOpen={() => onDay(date)}
            onValidate={() => validate(date)}
          />
        ))}
      </ul>
    </div>
  )
}
