import { formatInt } from '../../lib/format'
import { INTENSITIES, SPORTS, sportById, type SportSession } from '../../lib/needs'
import { ChevronIcon } from '../icons/ChevronIcon'
import { CloseIcon } from '../icons/CloseIcon'
import { Icon } from '../icons/Icon'
import { Segmented } from '../Segmented'

interface Props {
  session: SportSession
  number: number
  estimate: number | null
  onChange: (session: SportSession) => void
  onRemove: () => void
}

const ROUND = 'grid size-9 shrink-0 place-items-center rounded-full bg-white/8 active:bg-white/18 disabled:opacity-30'

export function SportCard({ session, number, estimate, onChange, onRemove }: Props) {
  const name = sportById(session.sport).label
  const sessions = (value: number) => onChange({ ...session, sessions: Math.min(14, Math.max(1, value)) })

  return (
    <li className="rounded-card border border-line bg-surface-2 p-3">
      <div className="flex items-center gap-2">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">{`Sport ${number}`}</span>
          <select
            value={session.sport}
            onChange={(e) => onChange({ ...session, sport: e.target.value })}
            className="h-11 w-full appearance-none rounded-xl bg-black/30 pr-9 pl-3 text-base font-semibold text-text outline-none"
          >
            {SPORTS.map((sport) => (
              <option key={sport.id} value={sport.id}>
                {sport.label}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-text-2">
            <ChevronIcon size={16} direction="down" />
          </span>
        </label>
        <button
          type="button"
          aria-label={`Retirer ${name}`}
          onClick={onRemove}
          className="grid size-9 shrink-0 place-items-center rounded-full text-text-2 active:bg-white/8"
        >
          <CloseIcon size={18} />
        </button>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div>
          <p className="mb-1 px-1 text-[12px] text-text-2">Fois par semaine</p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label={`Une séance de ${name} en moins`}
              disabled={session.sessions <= 1}
              onClick={() => sessions(session.sessions - 1)}
              className={ROUND}
            >
              <Icon size={18} strokeWidth={1.75}>
                <path d="M5 12h14" />
              </Icon>
            </button>
            <span aria-live="polite" className="min-w-0 flex-1 text-center text-[17px] font-semibold tabular-nums">
              {session.sessions}
            </span>
            <button
              type="button"
              aria-label={`Une séance de ${name} en plus`}
              disabled={session.sessions >= 14}
              onClick={() => sessions(session.sessions + 1)}
              className={ROUND}
            >
              <Icon size={18} strokeWidth={1.75}>
                <path d="M12 5v14M5 12h14" />
              </Icon>
            </button>
          </div>
        </div>
        <label className="block">
          <span className="mb-1 block px-1 text-[12px] text-text-2">Durée d’une séance</span>
          <span className="flex h-9 items-center gap-1 rounded-full bg-black/30 px-3">
            <input
              aria-label={`Durée d’une séance de ${name} en minutes`}
              inputMode="numeric"
              enterKeyHint="done"
              placeholder="60"
              value={session.minutes || ''}
              onChange={(e) => onChange({ ...session, minutes: Math.min(300, Number(e.target.value.replace(/\D/g, '').slice(0, 3))) })}
              onFocus={(e) => e.target.select()}
              onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
              className="w-full min-w-0 bg-transparent text-base font-semibold tabular-nums outline-none placeholder:text-white/20"
            />
            <span className="text-[14px] text-text-2">min</span>
          </span>
        </label>
      </div>
      <div className="mt-3">
        <Segmented
          label={`Intensité de ${name}`}
          value={session.intensity}
          options={INTENSITIES}
          onChange={(intensity) => onChange({ ...session, intensity })}
        />
      </div>
      {estimate !== null && session.minutes > 0 && (
        <p className="mt-2 px-1 text-[13px] text-text-2 tabular-nums">
          ≈ {formatInt(estimate)} kcal par séance · {formatInt((estimate * session.sessions) / 7)} kcal par jour en moyenne
        </p>
      )}
    </li>
  )
}
