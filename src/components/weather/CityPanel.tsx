import { useWeather } from '../../hooks/useWeather'
import type { Place } from '../../lib/places'
import { localHour } from '../../lib/weather'
import { ArrowUpIcon } from '../icons/ArrowUpIcon'
import { CheckIcon } from '../icons/CheckIcon'
import { HourList } from './HourList'

interface Props {
  place: Place
  active: boolean
  canRemove: boolean
  dateKey: string
  onActivate: () => void
  onRemove: () => void
}

export function CityPanel({ place, active, canRemove, dateKey, onActivate, onRemove }: Props) {
  const weather = useWeather(place, dateKey)

  return (
    <section aria-label={`Météo à ${place.name}`} className="flex h-full w-full shrink-0 snap-center flex-col px-7">
      <div className="flex items-center gap-3">
        <button
          type="button"
          role="radio"
          aria-checked={active}
          aria-label={`Afficher ${place.name} sur l’accueil`}
          onClick={onActivate}
          className={`grid size-6 shrink-0 place-items-center rounded-full border-2 transition-colors ${
            active ? 'border-accent bg-accent text-black' : 'border-white/30'
          }`}
        >
          {active && <CheckIcon size={14} strokeWidth={3} />}
        </button>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[22px] leading-tight font-semibold tracking-[-0.01em]">{place.name}</h3>
          <p className="truncate text-[13px] text-text-2">{place.region}</p>
        </div>
        {weather && (
          <span className="flex shrink-0 items-center gap-0.5 text-[17px] font-semibold tabular-nums">
            <span className="text-accent">
              <ArrowUpIcon size={15} strokeWidth={2.5} />
            </span>
            {weather.max}°
          </span>
        )}
      </div>
      {weather ? (
        <HourList hours={weather.hours} currentHour={localHour(weather)} />
      ) : (
        <div className="flex flex-1 items-center justify-center text-[15px] text-text-2">
          {navigator.onLine ? 'Chargement de la météo…' : 'Pas de connexion'}
        </div>
      )}
      {active ? (
        <p className="mt-1 flex h-8 shrink-0 items-center justify-center text-[13px] text-accent">
          Affichée sur l’accueil
        </p>
      ) : (
        canRemove && (
          <button type="button" onClick={onRemove} className="mt-1 h-8 shrink-0 text-[13px] text-text-2">
            Retirer cette ville
          </button>
        )
      )}
    </section>
  )
}
