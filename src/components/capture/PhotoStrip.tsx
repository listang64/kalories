import { AnimatePresence, motion } from 'motion/react'
import type { DraftPhoto } from '../../store/appStore'
import { CloseIcon } from '../icons/CloseIcon'

interface Props {
  photos: DraftPhoto[]
  onRemove: (id: string) => void
}

export function PhotoStrip({ photos, onRemove }: Props) {
  return (
    <div className="-mx-1 flex shrink-0 gap-2.5 overflow-x-auto px-1 pt-2 pb-1">
      <AnimatePresence initial={false}>
        {photos.map((photo, i) => (
          <motion.div
            key={photo.id}
            layout
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            className="relative size-16 shrink-0"
          >
            <img src={photo.src} alt={`Photo ${i + 1}`} className="size-full rounded-xl object-cover" />
            <button
              type="button"
              aria-label={`Retirer la photo ${i + 1}`}
              onClick={() => onRemove(photo.id)}
              className="absolute -top-2 -right-2 grid size-6 place-items-center rounded-full border border-line bg-surface-2 text-text"
            >
              <CloseIcon size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
