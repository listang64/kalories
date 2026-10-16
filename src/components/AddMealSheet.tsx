import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { mealLabel } from '../config/meals'
import { CaptureScreen } from '../screens/CaptureScreen'
import { ReviewScreen } from '../screens/ReviewScreen'
import { useAppStore, type AddStep } from '../store/appStore'
import { BottomSheet } from './BottomSheet'
import { AnalyzingView } from './capture/AnalyzingView'
import { ConfirmDialog } from './ConfirmDialog'
import { MealTypeButtons } from './MealTypeButtons'
import type { DayProgress } from './review/ReviewSummary'

const ORDER: AddStep[] = ['type', 'capture', 'analyzing', 'review']

const slide = {
  enter: (direction: number) => ({ opacity: 0, x: 48 * direction }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: -48 * direction }),
}

export function AddMealSheet({ progress }: { progress: DayProgress }) {
  const open = useAppStore((s) => s.overlay === 'add')
  const step = useAppStore((s) => s.addStep)
  const type = useAppStore((s) => s.draft.type)
  const dirty = useAppStore((s) => s.reviewDirty)
  const setOverlay = useAppStore((s) => s.setOverlay)
  const setAddStep = useAppStore((s) => s.setAddStep)
  const chooseMealType = useAppStore((s) => s.chooseMealType)
  const cancelAnalysis = useAppStore((s) => s.cancelAnalysis)
  const [confirming, setConfirming] = useState(false)
  const previous = useRef(step)
  const direction = ORDER.indexOf(step) >= ORDER.indexOf(previous.current) ? 1 : -1

  useEffect(() => {
    previous.current = step
  }, [step])

  const close = () => (step === 'review' && dirty ? setConfirming(true) : setOverlay(null))
  const back = {
    type: undefined,
    capture: () => setAddStep('type'),
    analyzing: cancelAnalysis,
    review: () => setAddStep('capture'),
  }[step]
  const title = { type: 'Ajouter un repas', capture: mealLabel(type), analyzing: 'Analyse', review: 'Ton repas' }[step]

  return (
    <>
      <BottomSheet open={open} title={title} onClose={close} onBack={back}>
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 420, damping: 36 }}
            className="h-full"
          >
            {step === 'type' && (
              <div className="flex h-full flex-col justify-end gap-4 pb-2">
                <p className="label px-1">Quel repas ?</p>
                <MealTypeButtons selected={type} onChoose={chooseMealType} />
              </div>
            )}
            {step === 'capture' && <CaptureScreen />}
            {step === 'analyzing' && <AnalyzingView onCancel={cancelAnalysis} />}
            {step === 'review' && <ReviewScreen progress={progress} />}
          </motion.div>
        </AnimatePresence>
      </BottomSheet>
      <ConfirmDialog
        open={confirming}
        title="Abandonner ce repas ?"
        message="Tes modifications seront perdues."
        confirmLabel="Abandonner"
        cancelLabel="Continuer"
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          setConfirming(false)
          setOverlay(null)
        }}
      />
    </>
  )
}
