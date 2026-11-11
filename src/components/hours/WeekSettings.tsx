import { useState } from 'react'
import { addDays, formatShortDate } from '../../lib/dates'
import { emptyWeekDay, mondayOf, WEEKDAY_NAMES, WEEKDAYS, workedWeek, type HoursSettings, type WeekDay } from '../../lib/hours/model'
import { saveWeekDay } from '../../lib/hours/store'
import { completeSlots, formatDuration, formatSlot, slotsMinutes } from '../../lib/hours/time'
import { sharedErrorMessage } from '../../lib/shared'
import { useAppStore } from '../../store/appStore'
import { ChevronIcon } from '../icons/ChevronIcon'
import { Segmented } from '../Segmented'
import { Card, CheckRow, SlotsEditor, Title } from './ui'

interface Props {
  uid: string
  settings: HoursSettings
  today: string
}

function DayCard({ uid, index, day: saved, today }: { uid: string; index: number; day: WeekDay; today: string }) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(saved)
  const day = open ? draft : saved
  const key = WEEKDAYS[index] ?? '1'
  const monday = mondayOf(today)
  const slots = completeSlots(day.slots)
  const save = (next: Partial<WeekDay>) => {
    const value = { ...day, ...next }
    setDraft(value)
    return saveWeekDay(uid, key, value).catch((error: unknown) => useAppStore.getState().showToast(sharedErrorMessage(error)))
  }
  const toggle = () => {
    setDraft(saved)
    setOpen(!open)
  }

  return (
    <li className="rounded-xl border border-line bg-black/20">
      <button type="button" aria-expanded={open} onClick={toggle} className="press flex min-h-13 w-full items-center gap-3 px-3 py-2 text-left">
        <span className="min-w-0 flex-1">
          <span className="block text-[16px] font-semibold">{WEEKDAY_NAMES[index]}</span>
          <span className="block truncate text-[13px] text-text-2">
            {slots.length ? slots.map((slot) => formatSlot(slot)).join(' · ') : 'Repos'}
            {slots.length > 0 && day.alternate ? ' · 1 sem. sur 2' : ''}
          </span>
        </span>
        {slots.length > 0 && <span className="text-[15px] font-semibold tabular-nums">{formatDuration(slotsMinutes(slots))}</span>}
        <ChevronIcon size={18} direction={open ? 'up' : 'down'} />
      </button>
      {open && (
        <div className="flex flex-col gap-2 border-t border-line px-3 pt-3 pb-2">
          <SlotsEditor slots={day.slots} onChange={(next) => void save({ slots: next })} />
          {day.slots.length > 0 && (
            <>
              <CheckRow checked={day.meal} onChange={(meal) => void save({ meal })}>
                Repas pris au travail
              </CheckRow>
              <CheckRow checked={day.alternate} onChange={(alternate) => void save({ alternate, anchor: day.anchor || monday })}>
                Une semaine sur deux
              </CheckRow>
              {day.alternate && (
                <div className="pb-1">
                  <p className="mb-2 text-[13px] text-text-2">Cette semaine (du {formatShortDate(monday)}), ce jour est :</p>
                  <Segmented
                    label="Cette semaine"
                    value={workedWeek(day, today) ? 'on' : 'off'}
                    options={[
                      { value: 'on', label: 'Travaillé' },
                      { value: 'off', label: 'Non travaillé' },
                    ]}
                    onChange={(value) => void save({ anchor: value === 'on' ? monday : addDays(monday, -7) })}
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}
    </li>
  )
}

export function WeekSettings({ uid, settings, today }: Props) {
  const total = WEEKDAYS.reduce((sum, key) => sum + slotsMinutes(completeSlots(settings.week[key]?.slots ?? [])), 0)

  return (
    <Card>
      <Title aside={total ? `${formatDuration(total)} / semaine` : undefined}>Semaine type</Title>
      <ul className="flex flex-col gap-2">
        {WEEKDAYS.map((key, index) => (
          <DayCard key={key} uid={uid} index={index} day={settings.week[key] ?? emptyWeekDay()} today={today} />
        ))}
      </ul>
      <p className="mt-3 text-[13px] leading-snug text-text-2">
        Ta semaine type sert à valider une journée classique d’une coche verte dans la liste du mois.
      </p>
    </Card>
  )
}
