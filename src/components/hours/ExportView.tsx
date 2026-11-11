import { useState } from 'react'
import type { HoursData } from '../../hooks/useHours'
import { formatShortDate } from '../../lib/dates'
import { balanceAt, balanceWord, fullName, lastDayOf, monthLabel, shiftMonth } from '../../lib/hours/model'
import { hoursFileName, hoursPdf } from '../../lib/hours/pdf'
import { formatDuration } from '../../lib/hours/time'
import { shareFile } from '../../lib/share'
import { useAppStore } from '../../store/appStore'
import { BigButton } from '../game/ui'
import { DocumentIcon } from '../icons/DocumentIcon'
import { Card, INPUT, MonthNav, Title } from './ui'

interface Props {
  data: HoursData
  month: string
  today: string
  fallbackName: string
  onSettings: () => void
}

function Line({ label, minutes }: { label: string; minutes: number }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-[14px] text-text-2">{label}</span>
      <span className="text-[17px] font-semibold tabular-nums">
        {formatDuration(minutes, true)} <span className="text-[13px] font-normal text-text-2">{balanceWord(minutes)}</span>
      </span>
    </div>
  )
}

export function ExportView({ data, month: initialMonth, today, fallbackName, onSettings }: Props) {
  const [month, setMonth] = useState(initialMonth)
  const [at, setAt] = useState(lastDayOf(initialMonth))
  const [busy, setBusy] = useState(false)
  const named = Boolean(data.settings.firstName || data.settings.lastName)
  const name = fullName(data.settings, fallbackName)

  const shift = (delta: number) => {
    const next = shiftMonth(month, delta)
    setMonth(next)
    setAt(lastDayOf(next))
  }

  const exportPdf = async () => {
    setBusy(true)
    try {
      const blob = hoursPdf({ name, month, at, today, settings: data.settings, months: data.months })
      const file = new File([blob], hoursFileName(name, month), { type: 'application/pdf' })
      if ((await shareFile(file).catch(() => null)) === 'downloaded') useAppStore.getState().showToast('PDF téléchargé')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 pb-2">
      <Card className="flex flex-col gap-3">
        <Title>Mois à exporter</Title>
        <MonthNav label={monthLabel(month)} onShift={shift} />
      </Card>
      <Card className="flex flex-col gap-3">
        <Title>Solde à une date précise</Title>
        <input type="date" aria-label="Date du solde" value={at} onChange={(e) => e.target.value && setAt(e.target.value)} className={INPUT} />
        <Line label={`Au ${formatShortDate(at)}`} minutes={balanceAt(data.settings, data.months, at)} />
        <Line label={`À ce jour (${formatShortDate(today)})`} minutes={balanceAt(data.settings, data.months, today)} />
      </Card>
      {!named && (
        <button type="button" onClick={onSettings} className="press rounded-card border border-dashed border-accent/50 p-3 text-left text-[14px] text-text-2">
          Le PDF portera le nom « {name} ». <span className="text-accent">Ajouter nom et prénom</span>
        </button>
      )}
      <BigButton onClick={() => void exportPdf()} disabled={busy}>
        <DocumentIcon size={20} />
        Exporter le PDF
      </BigButton>
      <p className="px-1 text-center text-[13px] text-text-2">Une seule page : chaque jour du mois, les repas, le total et les soldes.</p>
    </div>
  )
}
