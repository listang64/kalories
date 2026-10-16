import { formatLongDate } from '../../lib/dates'
import { GearIcon } from '../icons/GearIcon'

interface Props {
  dateKey: string
  onSettings: () => void
}

export function HomeHeader({ dateKey, onSettings }: Props) {
  return (
    <header className="flex items-start justify-between pt-3">
      <div>
        <h1 className="text-[28px] leading-tight font-semibold tracking-[-0.02em]">Aujourd’hui</h1>
        <p className="text-[15px] text-text-2">{formatLongDate(dateKey)}</p>
      </div>
      <button
        type="button"
        aria-label="Paramètres"
        onClick={onSettings}
        className="-mr-2 grid size-11 place-items-center rounded-full text-text-2 transition-colors active:bg-white/8"
      >
        <GearIcon />
      </button>
    </header>
  )
}
