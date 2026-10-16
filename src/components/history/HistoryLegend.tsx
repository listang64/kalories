import { PROFILE_LIST, type ProfileId } from '../../config/users'

interface Props {
  hidden: ProfileId[]
  onToggle: (id: ProfileId) => void
}

export function HistoryLegend({ hidden, onToggle }: Props) {
  return (
    <div className="flex gap-2">
      {PROFILE_LIST.map((profile) => {
        const off = hidden.includes(profile.id)
        return (
          <button
            key={profile.id}
            type="button"
            aria-pressed={!off}
            onClick={() => onToggle(profile.id)}
            className={`press flex h-9 items-center gap-2 rounded-full border border-line bg-surface-2 px-3.5 text-[14px] transition-opacity ${off ? 'opacity-40' : ''}`}
          >
            <span className="h-0.5 w-4 rounded-full" style={{ background: profile.chartColor }} />
            {profile.name}
          </button>
        )
      })}
      <span className="ml-auto flex items-center gap-2 text-[12px] text-text-2">
        <svg width="16" height="2" aria-hidden="true">
          <line x1="0" x2="16" y1="1" y2="1" stroke="currentColor" strokeDasharray="3 3" />
        </svg>
        Plafond
      </span>
    </div>
  )
}
