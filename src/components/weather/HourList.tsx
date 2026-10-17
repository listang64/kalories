import { kindOf, WEATHER_LABELS, type HourWeather } from '../../lib/weather'
import { WeatherIcon } from '../icons/WeatherIcon'

export function HourList({ hours, currentHour }: { hours: HourWeather[]; currentHour: number }) {
  const temps = hours.map((h) => h.temp)
  const low = Math.min(...temps)
  const span = Math.max(...temps) - low || 1

  return (
    <ul className="mt-2 min-h-0 flex-1 overflow-y-auto">
      {hours.map((h) => {
        const share = 0.18 + (0.82 * (h.temp - low)) / span
        const current = h.hour === currentHour
        return (
          <li
            key={h.hour}
            aria-label={`${h.hour} heures : ${h.temp} degrés, ${WEATHER_LABELS[kindOf(h.code)].toLowerCase()}`}
            className={`flex h-[clamp(25px,3.9dvh,30px)] items-center gap-3 rounded-[10px] px-2 ${current ? 'bg-white/8' : ''}`}
          >
            <span
              className={`w-11 text-[15px] tabular-nums ${current ? 'font-semibold text-accent' : 'text-text-2'}`}
            >
              {h.hour} h
            </span>
            <WeatherIcon kind={kindOf(h.code)} night={h.night} size={20} />
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/8">
              <span
                className="block h-full rounded-full"
                style={{
                  width: `${share * 100}%`,
                  backgroundImage: 'linear-gradient(90deg, var(--rain), var(--sun))',
                  backgroundSize: `${100 / share}% 100%`,
                }}
              />
            </span>
            <span className="w-9 text-right text-[16px] font-semibold tabular-nums">{h.temp}°</span>
          </li>
        )
      })}
    </ul>
  )
}
