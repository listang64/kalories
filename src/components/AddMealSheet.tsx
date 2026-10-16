import { AnimatePresence, motion } from 'motion/react'
import { mealLabel } from '../config/meals'
import { CaptureScreen } from '../screens/CaptureScreen'
import { useAppStore } from '../store/appStore'
import { BottomSheet } from './BottomSheet'
import { MealTypeButtons } from './MealTypeButtons'

export function AddMealSheet() {
  const open = useAppStore((s) => s.overlay === 'add')
  const step = useAppStore((s) => s.addStep)
  const type = useAppStore((s) => s.draft.type)
  const setOverlay = useAppStore((s) => s.setOverlay)
  const chooseMealType = useAppStore((s) => s.chooseMealType)
  const backToMealType = useAppStore((s) => s.backToMealType)
  const forward = step === 'capture'

  return (
    <BottomSheet
      open={open}
      title={forward ? mealLabel(type) : 'Ajouter un repas'}
      onClose={() => setOverlay(null)}
      onBack={forward ? backToMealType : undefined}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          className="h-full"
          initial={{ opacity: 0, x: forward ? 48 : -48 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: forward ? -48 : 48 }}
          transition={{ type: 'spring', stiffness: 420, damping: 36 }}
        >
          {forward ? (
            <CaptureScreen />
          ) : (
            <div className="flex h-full flex-col justify-end gap-4 pb-2">
              <p className="label px-1">Quel repas ?</p>
              <MealTypeButtons selected={type} onChoose={chooseMealType} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </BottomSheet>
  )
}
