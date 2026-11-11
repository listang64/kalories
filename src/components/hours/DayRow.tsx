import { useEffect, useRef } from 'react'
import { dateFromKey } from '../../lib/dates'
import { entryMinutes, type DayEntry, type WeekDay } from '../../lib/hours/model'
import { completeSlots, formatDuration, formatSlot, slotsMinutes } from '../../lib/hours/time'
import { CheckIcon } from '../icons/CheckIcon'
import { CutleryIcon } from '../icons/CutleryIcon'
import { GREEN, RED } from './ui'

interface Props {
  date: string
  today: string
  entry: DayEntry | undefined
  template: WeekDay | null
  onOpen: () => void
  onValidate: () => void
}

const SHORT = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.']

function Slots({ slots, muted }: { slots: DayEntry['slots']; muted?: boolean }) {
  return (
    <span className={`flex flex-wrap gap-x-2 text-[15px] leading-snug tabular-nums ${muted ? 'text-text-2' : ''}`}>
      {completeSlots(slots).map((slot, i) => (
        <span key={i} className="whitespace-nowrap">
          {formatSlot(slot)}
        </span>
      ))}
    </span>
  )
}

function Content({ entry, template, future }: { entry: DayEntry | undefined; template: WeekDay | null; future: boolean }) {
  if (entry?.off)
    return (
      <span className="text-[15px] text-text-2">
        Non travaillé · <span style={entry.justified ? undefined : { color: RED }}>{entry.justified ? 'justifié' : 'non justifié'}</span>
      </span>
    )
  if (entry) return <Slots slots={entry.slots} />
  if (template)
    return (
      <span className="flex flex-col">
        <span className="text-[11px] tracking-wide text-text-2 uppercase">{future ? 'Prévu' : 'À valider'}</span>
        <Slots slots={template.slots} muted />
      </span>
    )
  return <span className="text-[15px] text-text-2/60">—</span>
}

export function DayRow({ date, today, entry, template, onOpen, onValidate }: Props) {
  const day = dateFromKey(date)
  const isToday = date === today
  const future = date > today
  const minutes = entry ? entryMinutes(entry) : 0
  const weekend = day.getDay() === 0 || day.getDay() === 6
  const canValidate = !entry && template !== null && !future
  const row = useRef<HTMLLIElement>(null)

  useEffect(() => {
    if (isToday) row.current?.scrollIntoView({ block: 'center' })
  }, [isToday])

  return (
    <li ref={row} className={`flex items-stretch gap-2 rounded-card border ${isToday ? 'border-accent/60' : 'border-line'} ${weekend ? 'bg-white/[0.03]' : 'bg-surface-2'}`}>
      <button type="button" onClick={onOpen} className="press flex min-h-15 min-w-0 flex-1 items-center gap-3 py-2 pl-3 text-left">
        <span className={`flex w-9 shrink-0 flex-col items-center leading-none ${isToday ? 'text-accent' : future ? 'text-text-2' : ''}`}>
          <span className="text-[12px]">{SHORT[day.getDay()]}</span>
          <span className="mt-1 text-[21px] font-semibold tabular-nums">{day.getDate()}</span>
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <Content entry={entry} template={template} future={future} />
          {entry?.note && <span className="truncate text-[13px] text-text-2">{entry.note}</span>}
        </span>
        <span className="flex shrink-0 flex-col items-end gap-1 pr-1">
          {entry && !entry.off && <span className="text-[16px] font-semibold tabular-nums">{formatDuration(minutes)}</span>}
          {entry?.off && !entry.justified && template && (
            <span className="text-[16px] font-semibold tabular-nums" style={{ color: RED }}>
              {formatDuration(-slotsMinutes(template.slots))}
            </span>
          )}
          {!entry && template && <span className="text-[14px] text-text-2 tabular-nums">{formatDuration(slotsMinutes(template.slots))}</span>}
          {entry?.meal && !entry.off && (
            <span className="text-accent" aria-label="Repas pris au travail">
              <CutleryIcon size={15} />
            </span>
          )}
        </span>
      </button>
      {canValidate ? (
        <button
          type="button"
          aria-label="Horaires habituels faits : valider"
          onClick={onValidate}
          className="press my-2 mr-2 grid size-11 shrink-0 place-items-center self-center rounded-full border-2 text-black"
          style={{ borderColor: GREEN, background: GREEN }}
        >
          <CheckIcon size={22} strokeWidth={3} />
        </button>
      ) : (
        <span className="w-1 shrink-0" />
      )}
    </li>
  )
}
