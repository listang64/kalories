import { AnimatePresence, motion } from 'motion/react'
import { useWeather } from '../../hooks/useWeather'
import { WEATHER_LABELS, WEATHER_PLACE } from '../../lib/weather'
import { WeatherIcon } from '../icons/WeatherIcon'

export function WeatherBadge({ dateKey }: { dateKey: string }) {
  const weather = useWeather(dateKey)

  return (
    <div className="mt-1.5 h-7">
      <AnimatePresence>
        {weather && (
          <motion.div
            role="img"
            aria-label={`Météo à ${WEATHER_PLACE} : ${WEATHER_LABELS[weather.kind]}, ${weather.max} °C au plus chaud`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex h-7 items-center gap-2"
          >
            <span className="text-[20px] leading-none font-semibold tabular-nums">{weather.max}°</span>
            <WeatherIcon kind={weather.kind} size={24} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
