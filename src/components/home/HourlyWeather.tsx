import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { kindOf, WEATHER_LABELS, WEATHER_PLACE, type HourWeather, type Weather } from '../../lib/weather'
import { ArrowUpIcon } from '../icons/ArrowUpIcon'
import { WeatherIcon } from '../icons/WeatherIcon'

interface Props {
  weather: Weather
  open: boolean
  onClose: () => void
}

export function HourlyWeather({ weather, open, onClose }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] grid place-items-center bg-black/60 px-6 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Météo heure par heure à ${WEATHER_PLACE}`}
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            className="w-full max-w-sm rounded-sheet border border-line bg-surface-2 px-4 pt-5 pb-3 shadow-[0_24px_60px_rgba(0,0,0,0.6)]"
          >
            <div className="flex items-baseline justify-between px-2">
              <h2 className="text-[22px] font-semibold tracking-[-0.01em]">{WEATHER_PLACE}</h2>
              <span className="flex items-center gap-0.5 text-[17px] font-semibold tabular-nums">
                <span className="text-accent">
                  <ArrowUpIcon size={15} strokeWidth={2.5} />
                </span>
                {weather.max}°
              </span>
            </div>
            <p className="px-2 text-[13px] text-text-2">Aujourd’hui, heure par heure</p>
            <HourList hours={weather.hours} />
            <p className="mt-2 text-center text-[12px] text-text-2">Touche n’importe où pour fermer</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

function HourList({ hours }: { hours: HourWeather[] }) {
  const now = new Date().getHours()
  const temps = hours.map((h) => h.temp)
  const low = Math.min(...temps)
  const span = Math.max(...temps) - low || 1

  return (
    <ul className="mt-2 max-h-[calc(100dvh-170px)] overflow-y-auto">
      {hours.map((h) => {
        const share = 0.18 + (0.82 * (h.temp - low)) / span
        const current = h.hour === now
        return (
          <li
            key={h.hour}
            aria-label={`${h.hour} heures : ${h.temp} degrés, ${WEATHER_LABELS[kindOf(h.code)].toLowerCase()}`}
            className={`flex h-[30px] items-center gap-3 rounded-[10px] px-2 ${current ? 'bg-white/8' : ''}`}
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
