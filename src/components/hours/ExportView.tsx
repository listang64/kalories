import { useState } from 'react'
import type { HoursData } from '../../hooks/useHours'
import { fullName, monthLabel, shiftMonth } from '../../lib/hours/model'
import { hoursFileName, hoursPdf } from '../../lib/hours/pdf'
import { shareFile } from '../../lib/share'
import { useAppStore } from '../../store/appStore'
import { BigButton } from '../game/ui'
import { DocumentIcon } from '../icons/DocumentIcon'
import { Card, MonthNav, Title } from './ui'

interface Props {
  data: HoursData
  month: string
  today: string
  fallbackName: string
  onSettings: () => void
}

export function ExportView({ data, month: initialMonth, today, fallbackName, onSettings }: Props) {
  const [month, setMonth] = useState(initialMonth)
  const [busy, setBusy] = useState(false)
  const named = Boolean(data.settings.firstName || data.settings.lastName)
  const name = fullName(data.settings, fallbackName)

  const exportPdf = async () => {
    setBusy(true)
    try {
      const blob = hoursPdf({ name, month, today, settings: data.settings, months: data.months })
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
        <MonthNav label={monthLabel(month)} onShift={(delta) => setMonth(shiftMonth(month, delta))} />
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
      <p className="px-1 text-center text-[13px] text-text-2">
        Une seule page : chaque jour du mois, les repas et le total. Les écarts avec ton horaire type sont en rouge.
      </p>
    </div>
  )
}
