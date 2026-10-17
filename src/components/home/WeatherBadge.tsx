import { useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useWeather } from '../../hooks/useWeather'
import { useActivePlace } from '../../lib/places'
import { WEATHER_LABELS, type WeatherKind } from '../../lib/weather'
import { ArrowUpIcon } from '../icons/ArrowUpIcon'
import { WeatherIcon } from '../icons/WeatherIcon'
import { WeatherPopup } from '../weather/WeatherPopup'

const TICK = 'absolute bottom-0 h-[7px] w-[1.5px] rounded-full bg-white/30'

export function WeatherBadge({ dateKey }: { dateKey: string }) {
  const place = useActivePlace()
  const weather = useWeather(place, dateKey)
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])

  return (
    <div className="mt-2 mb-3 flex h-9 justify-center">
      <AnimatePresence>
        {weather && (
          <motion.button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={`Météo à ${place.name} : ${weather.max} °C au plus chaud, matin ${WEATHER_LABELS[weather.morning].toLowerCase()}, après-midi ${WEATHER_LABELS[weather.afternoon].toLowerCase()}. Toucher pour voir le détail heure par heure`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="press flex h-9 items-end gap-3"
          >
            <span className="flex items-center gap-0.5 pb-px text-[20px] leading-none font-semibold tabular-nums">
              <span className="text-accent">
                <ArrowUpIcon size={17} strokeWidth={2.5} />
              </span>
              {weather.max}°
            </span>
            <DaySchema morning={weather.morning} afternoon={weather.afternoon} place={place.name} />
          </motion.button>
        )}
      </AnimatePresence>
      <WeatherPopup open={open} dateKey={dateKey} onClose={close} />
    </div>
  )
}

function DaySchema({ morning, afternoon, place }: { morning: WeatherKind; afternoon: WeatherKind; place: string }) {
  return (
    <span className="relative flex pb-[5px]">
      <span className="absolute inset-x-0 bottom-0 h-[1.5px] rounded-full bg-white/30" />
      <span className={`${TICK} left-0`} />
      <span className={`${TICK} left-1/2 -translate-x-1/2`} />
      <span className={`${TICK} right-0`} />
      {[morning, afternoon].map((kind, i) => (
        <span key={i} className="grid w-12 place-items-center">
          <WeatherIcon kind={kind} size={26} />
        </span>
      ))}
      <span className="absolute inset-x-[-24px] top-full mt-1 truncate text-center text-[10.5px] leading-none text-text-2">
        {place}
      </span>
    </span>
  )
}
