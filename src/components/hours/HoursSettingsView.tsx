import { useState } from 'react'
import type { HoursData } from '../../hooks/useHours'
import { formatShortDate } from '../../lib/dates'
import { balanceAt, balanceWord, MONTH_NAMES } from '../../lib/hours/model'
import { saveBalance, saveName, saveTarget } from '../../lib/hours/store'
import { formatDuration } from '../../lib/hours/time'
import { sharedErrorMessage } from '../../lib/shared'
import { useAppStore } from '../../store/appStore'
import { FIELD_INPUT, Field } from '../Field'
import { Segmented } from '../Segmented'
import { Card, GREEN, HoursInput, INPUT, MonthNav, RED, Title } from './ui'
import { WeekSettings } from './WeekSettings'

interface Props {
  uid: string
  data: HoursData
  today: string
}

const fail = (error: unknown) => useAppStore.getState().showToast(sharedErrorMessage(error))

function Identity({ uid, data }: Omit<Props, 'today'>) {
  const [first, setFirst] = useState(data.settings.firstName)
  const [last, setLast] = useState(data.settings.lastName)
  const commit = () => {
    if (first.trim() !== data.settings.firstName || last.trim() !== data.settings.lastName) saveName(uid, first, last).catch(fail)
  }

  return (
    <Card className="flex flex-col gap-3">
      <Title>Identité (pour le PDF)</Title>
      <Field label="Prénom">
        <input value={first} onChange={(e) => setFirst(e.target.value)} onBlur={commit} autoCapitalize="words" autoComplete="given-name" className={FIELD_INPUT} />
      </Field>
      <Field label="Nom">
        <input value={last} onChange={(e) => setLast(e.target.value)} onBlur={commit} autoCapitalize="words" autoComplete="family-name" className={FIELD_INPUT} />
      </Field>
    </Card>
  )
}

function Targets({ uid, data, today }: Props) {
  const [year, setYear] = useState(Number(today.slice(0, 4)))

  return (
    <Card>
      <Title>Heures cibles par mois</Title>
      <MonthNav label={String(year)} onShift={(delta) => setYear(year + delta)} />
      <ul className="mt-3 divide-y divide-line">
        {MONTH_NAMES.map((name, index) => {
          const month = `${year}-${String(index + 1).padStart(2, '0')}`
          const value = data.settings.targets[month] ?? null
          return (
            <li key={month} className="flex min-h-13 items-center justify-between gap-3 py-1.5">
              <span className={`text-[16px] ${month === today.slice(0, 7) ? 'font-semibold text-accent' : ''}`}>{name}</span>
              <span className="flex items-center gap-3">
                {value !== null && <span className="text-[13px] text-text-2 tabular-nums">{formatDuration(value * 60)}</span>}
                <HoursInput label={`Objectif ${name} ${year}`} value={value} placeholder="—" onCommit={(hours) => saveTarget(uid, month, hours).catch(fail)} />
              </span>
            </li>
          )
        })}
      </ul>
      <p className="mt-2 text-[13px] leading-snug text-text-2">
        En heures décimales (151,75 = 151h45 ; 0,50 = 30 min).
      </p>
    </Card>
  )
}

function BalanceSettings({ uid, data, today }: Props) {
  const saved = data.settings.balance
  const [date, setDate] = useState(saved?.date ?? today)
  const [sign, setSign] = useState<'plus' | 'minus'>(saved && saved.hours < 0 ? 'minus' : 'plus')
  const [hours, setHours] = useState<number | null>(saved ? Math.abs(saved.hours) : null)
  const balance = balanceAt(data.settings, data.months, today)
  const value = (hours ?? 0) * (sign === 'minus' ? -1 : 1)
  const changed = !saved || saved.date !== date || saved.hours !== value

  return (
    <Card className="flex flex-col gap-3">
      <Title>Compteur global</Title>
      <div className="flex items-center justify-between rounded-xl bg-black/30 px-3 py-3">
        <span className="text-[14px] text-text-2">Aujourd’hui</span>
        <span className="text-right">
          <span className="block text-[24px] leading-tight font-semibold tabular-nums" style={{ color: balance < 0 ? RED : balance > 0 ? GREEN : undefined }}>
            {formatDuration(balance, true)}
          </span>
          <span className="text-[13px] text-text-2">{balanceWord(balance)}</span>
        </span>
      </div>
      <p className="text-[14px] leading-snug text-text-2">Mets le compteur à jour avec le solde connu à une date (heures à devoir ou en plus).</p>
      <label className="block">
        <span className="label px-1">Solde au</span>
        <input type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} className={`mt-1.5 ${INPUT}`} />
      </label>
      <Segmented
        label="Sens du solde"
        value={sign}
        options={[
          { value: 'plus', label: 'En plus' },
          { value: 'minus', label: 'À devoir' },
        ]}
        onChange={setSign}
      />
      <div className="flex items-center justify-between">
        <span className="text-[16px]">Nombre d’heures</span>
        <HoursInput label="Nombre d’heures du solde" value={hours} onCommit={setHours} />
      </div>
      <button
        type="button"
        disabled={!changed}
        onClick={() => saveBalance(uid, { date, hours: value }).catch(fail)}
        className="press h-12 rounded-full bg-accent text-[16px] font-semibold text-black disabled:opacity-35"
      >
        {changed ? 'Mettre à jour le compteur' : `Solde enregistré au ${formatShortDate(saved.date)}`}
      </button>
      <p className="text-[13px] leading-snug text-text-2">
        Ensuite, chaque journée saisie après cette date ajoute ses heures en plus ou retire ses heures en moins par rapport à ton horaire type. Un jour non travaillé justifié ne change rien ; non justifié, il retire les heures prévues.
      </p>
    </Card>
  )
}

export function HoursSettingsView({ uid, data, today }: Props) {
  return (
    <div className="flex flex-col gap-4 pb-2">
      <Identity uid={uid} data={data} />
      <WeekSettings uid={uid} settings={data.settings} today={today} />
      <Targets uid={uid} data={data} today={today} />
      <BalanceSettings uid={uid} data={data} today={today} />
    </div>
  )
}
