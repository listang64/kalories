import { AnimatePresence, motion } from 'motion/react'
import { useWeather } from '../../hooks/useWeather'
import { WEATHER_LABELS, WEATHER_PLACE, type WeatherKind } from '../../lib/weather'
import { WeatherIcon } from '../icons/WeatherIcon'

const TICK = 'absolute bottom-0 h-[7px] w-[1.5px] rounded-full bg-white/30'

export function WeatherBadge({ dateKey }: { dateKey: string }) {
  const weather = useWeather(dateKey)

  return (
    <div className="mt-2 flex h-9 justify-center">
      <AnimatePresence>
        {weather && (
          <motion.div
            role="img"
            aria-label={`Météo à ${WEATHER_PLACE} : ${weather.max} °C au plus chaud, matin ${WEATHER_LABELS[weather.morning].toLowerCase()}, après-midi ${WEATHER_LABELS[weather.afternoon].toLowerCase()}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex h-9 items-end gap-3"
          >
            <span className="pb-px text-[20px] leading-none font-semibold tabular-nums">{weather.max}°</span>
            <DaySchema morning={weather.morning} afternoon={weather.afternoon} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function DaySchema({ morning, afternoon }: { morning: WeatherKind; afternoon: WeatherKind }) {
  return (
    <div className="relative flex pb-[5px]">
      <span className="absolute inset-x-0 bottom-0 h-[1.5px] rounded-full bg-white/30" />
      <span className={`${TICK} left-0`} />
      <span className={`${TICK} left-1/2 -translate-x-1/2`} />
      <span className={`${TICK} right-0`} />
      {[morning, afternoon].map((kind, i) => (
        <span key={i} className="grid w-11 place-items-center">
          <WeatherIcon kind={kind} size={22} />
        </span>
      ))}
    </div>
  )
}
