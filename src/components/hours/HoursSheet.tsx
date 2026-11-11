import { useState } from 'react'
import { useHours } from '../../hooks/useHours'
import { useToday } from '../../hooks/useToday'
import { dayOf, monthOf, shiftMonth, templateFor } from '../../lib/hours/model'
import type { Profile } from '../../lib/profiles'
import { BottomSheet } from '../BottomSheet'
import { LoadingDots } from '../LoadingDots'
import { DocumentIcon } from '../icons/DocumentIcon'
import { GearIcon } from '../icons/GearIcon'
import { DayEditor } from './DayEditor'
import { ExportView } from './ExportView'
import { HoursSettingsView } from './HoursSettingsView'
import { MonthView } from './MonthView'

type View = { name: 'month' } | { name: 'day'; date: string } | { name: 'settings' } | { name: 'export' }

const TITLES: Record<View['name'], string> = {
  month: 'Horaires',
  day: 'Ma journée',
  settings: 'Réglages des horaires',
  export: 'Exporter en PDF',
}

const ROUND = 'press grid size-10 place-items-center rounded-full bg-surface-2 text-accent'

export function HoursSheet({ me, open, onClose }: { me: Profile; open: boolean; onClose: () => void }) {
  const today = useToday()
  const data = useHours(me.uid, open)
  const [view, setView] = useState<View>({ name: 'month' })
  const [month, setMonth] = useState(monthOf(today))
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setView({ name: 'month' })
      setMonth(monthOf(today))
    }
  }

  const actions =
    view.name === 'month' ? (
      <>
        <button type="button" aria-label="Exporter en PDF" onClick={() => setView({ name: 'export' })} className={ROUND}>
          <DocumentIcon size={20} />
        </button>
        <button type="button" aria-label="Réglages des horaires" onClick={() => setView({ name: 'settings' })} className={ROUND}>
          <GearIcon size={21} />
        </button>
      </>
    ) : undefined

  const body = () => {
    if (!data.loaded) return <div className="grid place-items-center py-16"><LoadingDots /></div>
    if (data.denied) return <p className="py-10 text-center text-[15px] text-text-2">Accès refusé : reconnecte-toi à Kalories.</p>
    switch (view.name) {
      case 'day':
        return (
          <DayEditor
            key={view.date}
            uid={me.uid}
            date={view.date}
            entry={data.months[monthOf(view.date)]?.[dayOf(view.date)]}
            template={templateFor(data.settings, view.date)}
            onDone={() => setView({ name: 'month' })}
          />
        )
      case 'settings':
        return <HoursSettingsView uid={me.uid} data={data} today={today} />
      case 'export':
        return <ExportView data={data} month={month} today={today} fallbackName={me.name} onSettings={() => setView({ name: 'settings' })} />
      default:
        return (
          <MonthView
            uid={me.uid}
            data={data}
            month={month}
            today={today}
            onMonth={(delta) => setMonth(shiftMonth(month, delta))}
            onDay={(date) => setView({ name: 'day', date })}
            onSettings={() => setView({ name: 'settings' })}
          />
        )
    }
  }

  return (
    <BottomSheet
      open={open}
      title={TITLES[view.name]}
      onClose={onClose}
      onBack={view.name === 'month' ? undefined : () => setView({ name: 'month' })}
      action={actions}
    >
      {body()}
    </BottomSheet>
  )
}
