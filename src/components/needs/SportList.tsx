import { SPORT_LIMIT } from '../../hooks/useNeedsForm'
import type { SportSession } from '../../lib/needs'
import { PlusIcon } from '../icons/PlusIcon'
import { NeedsSection } from './NeedsSection'
import { SportCard } from './SportCard'

interface Props {
  sports: SportSession[]
  estimate: ((session: SportSession) => number) | null
  onChange: (sports: SportSession[]) => void
}

const newSession = (): SportSession => ({
  key: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
  sport: 'muscu',
  sessions: 3,
  minutes: 60,
  intensity: 'normal',
})

export function SportList({ sports, estimate, onChange }: Props) {
  return (
    <NeedsSection
      title="Ton sport"
      footer="Compte la durée réelle de la séance, échauffement compris. La dépense tient compte de ton poids et de ton métabolisme."
    >
      {sports.length > 0 && (
        <ul className="mb-2 flex flex-col gap-2">
          {sports.map((session, index) => (
            <SportCard
              key={session.key}
              session={session}
              number={index + 1}
              estimate={estimate?.(session) ?? null}
              onChange={(next) => onChange(sports.map((item) => (item.key === next.key ? next : item)))}
              onRemove={() => onChange(sports.filter((item) => item.key !== session.key))}
            />
          ))}
        </ul>
      )}
      <button
        type="button"
        disabled={sports.length >= SPORT_LIMIT}
        onClick={() => onChange([...sports, newSession()])}
        className="press flex h-11 w-full items-center justify-center gap-1.5 rounded-full border border-dashed border-white/15 text-[15px] font-medium text-accent disabled:opacity-40"
      >
        <PlusIcon size={18} strokeWidth={2} />
        {sports.length ? 'Ajouter un autre sport' : 'Ajouter un sport'}
      </button>
    </NeedsSection>
  )
}
