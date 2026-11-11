import { useState } from 'react'
import { formatLongDate } from '../../lib/dates'
import type { DayEntry, WeekDay } from '../../lib/hours/model'
import { clearDay, saveDay } from '../../lib/hours/store'
import { completeSlots, formatDuration, slotsMinutes } from '../../lib/hours/time'
import { sharedErrorMessage } from '../../lib/shared'
import { useAppStore } from '../../store/appStore'
import { BigButton } from '../game/ui'
import { Segmented } from '../Segmented'
import { Card, CheckRow, SlotsEditor } from './ui'

interface Props {
  uid: string
  date: string
  entry: DayEntry | undefined
  template: WeekDay | null
  onDone: () => void
}

function initial(entry: DayEntry | undefined, template: WeekDay | null): DayEntry {
  if (entry) return { ...entry, slots: entry.off ? [] : entry.slots }
  if (template) return { slots: template.slots, meal: template.meal, off: false, justified: true, note: '' }
  return { slots: [{ start: '08:00', end: '12:00' }], meal: false, off: false, justified: true, note: '' }
}

const fail = (error: unknown) => useAppStore.getState().showToast(sharedErrorMessage(error))

export function DayEditor({ uid, date, entry, template, onDone }: Props) {
  const [draft, setDraft] = useState(() => initial(entry, template))
  const [error, setError] = useState('')
  const patch = (next: Partial<DayEntry>) => {
    setError('')
    setDraft((current) => ({ ...current, ...next }))
  }

  const save = () => {
    if (!draft.off && completeSlots(draft.slots).length === 0) {
      setError('Ajoute au moins une plage avec un début et une fin.')
      return
    }
    void saveDay(uid, date, draft).catch(fail)
    onDone()
  }

  const clear = () => {
    void clearDay(uid, date).catch(fail)
    onDone()
  }

  return (
    <div className="flex flex-col gap-4 pb-2">
      <h3 className="text-[22px] font-semibold">{formatLongDate(date)}</h3>
      <Segmented
        label="Type de journée"
        value={draft.off ? 'off' : 'work'}
        options={[
          { value: 'work', label: 'Travaillé' },
          { value: 'off', label: 'Non travaillé' },
        ]}
        onChange={(value) => patch(value === 'off' ? { off: true } : { off: false, slots: draft.slots.length ? draft.slots : initial(undefined, template).slots })}
      />
      {draft.off && (
        <Card className="flex flex-col gap-1">
          <CheckRow checked={draft.justified} onChange={(justified) => patch({ justified })}>
            Absence justifiée
          </CheckRow>
          <p className="text-[13px] leading-snug text-text-2">
            {draft.justified
              ? 'Arrêt de travail, congé, férié… : aucune heure retirée du compteur.'
              : template
                ? `Non justifiée : ${formatDuration(slotsMinutes(template.slots))} retirées du compteur.`
                : 'Non justifiée : aucune heure n’était prévue ce jour-là.'}
          </p>
        </Card>
      )}
      {!draft.off && (
        <Card className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <span className="label text-accent">Horaires</span>
            <span className="text-[17px] font-semibold tabular-nums">{formatDuration(slotsMinutes(draft.slots))}</span>
          </div>
          <SlotsEditor slots={draft.slots} onChange={(slots) => patch({ slots })} />
          {template && (
            <button type="button" onClick={() => patch({ slots: template.slots, meal: template.meal })} className="self-start text-[15px] text-accent">
              Reprendre mon horaire type
            </button>
          )}
          <div className="border-t border-line pt-1">
            <CheckRow checked={draft.meal} onChange={(meal) => patch({ meal })}>
              Repas pris au travail
            </CheckRow>
          </div>
        </Card>
      )}
      <label className="block">
        <span className="label px-1">{draft.off ? 'Motif' : 'Quelque chose d’inhabituel ?'}</span>
        <textarea
          value={draft.note}
          onChange={(e) => patch({ note: e.target.value.slice(0, 400) })}
          placeholder={draft.off ? 'ex. congé, maladie, férié, récupération…' : 'ex. réunion tardive, déplacement, oubli de badge…'}
          rows={3}
          className="mt-1.5 w-full resize-none rounded-card border border-line bg-black/30 p-3.5 text-base leading-snug outline-none placeholder:text-text-2 focus:border-white/20"
        />
      </label>
      {error && <p className="text-[15px] text-accent">{error}</p>}
      <BigButton onClick={save}>Enregistrer</BigButton>
      {entry && (
        <BigButton tone="danger" onClick={clear}>
          Vider la journée
        </BigButton>
      )}
    </div>
  )
}
