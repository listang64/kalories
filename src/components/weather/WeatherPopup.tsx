import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { usePlaces, type Place } from '../../lib/places'
import { ChevronIcon } from '../icons/ChevronIcon'
import { CloseIcon } from '../icons/CloseIcon'
import { SearchIcon } from '../icons/SearchIcon'
import { CityPanel } from './CityPanel'
import { SearchPanel } from './SearchPanel'

interface Props {
  open: boolean
  dateKey: string
  onClose: () => void
}

const ARROW = 'absolute top-1/2 z-10 grid size-8 -translate-y-1/2 place-items-center text-accent transition-opacity'

export function WeatherPopup({ open, dateKey, onClose }: Props) {
  const { places, activeId, addPlace, removePlace, setActive } = usePlaces()
  const trackRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const count = places.length + 1

  const go = (next: number, behavior: ScrollBehavior = 'smooth') => {
    const track = trackRef.current
    if (track) track.scrollTo({ left: Math.max(0, Math.min(count - 1, next)) * track.clientWidth, behavior })
  }

  useLayoutEffect(() => {
    if (!open) return
    const start = Math.max(0, usePlaces.getState().places.findIndex((p) => p.id === usePlaces.getState().activeId))
    setIndex(start)
    go(start, 'instant')
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft') go(index - 1)
      if (event.key === 'ArrowRight') go(index + 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, index, count, onClose])

  const onScroll = () => {
    const track = trackRef.current
    if (track && track.clientWidth > 0) setIndex(Math.round(track.scrollLeft / track.clientWidth))
  }

  const add = (place: Place) => {
    const saved = addPlace(place)
    requestAnimationFrame(() => go(usePlaces.getState().places.findIndex((p) => p.id === saved.id)))
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] grid place-items-center bg-black/60 px-3 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Météo heure par heure"
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            onClick={(event) => event.stopPropagation()}
            className="relative w-full max-w-sm min-w-0 rounded-sheet border border-line bg-surface-2 pt-3 pb-3 shadow-[0_24px_60px_rgba(0,0,0,0.6)]"
          >
            <div className="flex items-center justify-between px-3">
              <span className="size-9" />
              <div className="flex items-center gap-1.5" aria-hidden="true">
                {places.map((place, i) => (
                  <span
                    key={place.id}
                    className={`size-1.5 rounded-full transition-colors ${i === index ? 'bg-accent' : 'bg-white/25'}`}
                  />
                ))}
                <span className={places.length === index ? 'text-accent' : 'text-white/25'}>
                  <SearchIcon size={9} strokeWidth={3.5} />
                </span>
              </div>
              <button
                type="button"
                aria-label="Fermer"
                onClick={onClose}
                className="grid size-9 place-items-center rounded-full bg-white/8 text-text-2"
              >
                <CloseIcon size={18} />
              </button>
            </div>
            <button
              type="button"
              aria-label="Ville précédente"
              onClick={() => go(index - 1)}
              className={`${ARROW} left-0.5 ${index === 0 ? 'pointer-events-none opacity-0' : ''}`}
            >
              <ChevronIcon size={22} direction="left" />
            </button>
            <button
              type="button"
              aria-label="Ville suivante"
              onClick={() => go(index + 1)}
              className={`${ARROW} right-0.5 ${index >= count - 1 ? 'pointer-events-none opacity-0' : ''}`}
            >
              <ChevronIcon size={22} direction="right" />
            </button>
            <div
              ref={trackRef}
              onScroll={onScroll}
              className="mt-2 flex h-[min(580px,calc(100dvh-150px))] snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {places.map((place) => (
                <CityPanel
                  key={place.id}
                  place={place}
                  active={place.id === activeId}
                  canRemove={place.id !== activeId && places.length > 1}
                  dateKey={dateKey}
                  onActivate={() => setActive(place.id)}
                  onRemove={() => removePlace(place.id)}
                />
              ))}
              <SearchPanel onAdd={add} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
