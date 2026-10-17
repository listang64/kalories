import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { mealLabel } from '../config/meals'
import { CaptureScreen } from '../screens/CaptureScreen'
import { ReviewScreen } from '../screens/ReviewScreen'
import { useAppStore, type AddStep } from '../store/appStore'
import { BottomSheet } from './BottomSheet'
import { AnalyzingView } from './capture/AnalyzingView'
import { ConfirmDialog } from './ConfirmDialog'
import { PersonalChart } from './history/PersonalChart'
import { MealTypeButtons } from './MealTypeButtons'
import type { DayProgress } from '../lib/nutrition'
import type { Profile } from '../lib/profiles'

const ORDER: AddStep[] = ['type', 'capture', 'analyzing', 'review']

const slide = {
  enter: (direction: number) => ({ opacity: 0, x: 48 * direction }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: -48 * direction }),
}

interface Props {
  me: Profile
  progress: DayProgress
}

export function AddMealSheet({ me, progress }: Props) {
  const open = useAppStore((s) => s.overlay === 'add' || s.editing !== null)
  const editing = useAppStore((s) => s.editing)
  const addTarget = useAppStore((s) => s.addTarget)
  const closeEdit = useAppStore((s) => s.closeEdit)
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

  const finish = editing ? closeEdit : () => setOverlay(null)
  const close = () => (step === 'review' && dirty ? setConfirming(true) : finish())
  const back = editing ? undefined : {
    type: undefined,
    capture: () => setAddStep('type'),
    analyzing: cancelAnalysis,
    review: () => setAddStep('capture'),
  }[step]
  const title = editing
    ? 'Modifier le repas'
    : { type: 'Ajouter un repas', capture: mealLabel(type), analyzing: 'Analyse', review: 'Ton repas' }[step]
  const base = editing?.progress ?? addTarget?.progress ?? progress

  return (
    <>
      <BottomSheet open={open} title={title} onClose={close} onBack={back} centered>
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
              <div className="flex h-full flex-col gap-4 pb-2">
                <PersonalChart me={me} />
                <p className="label text-center text-accent">Quel repas ?</p>
                <MealTypeButtons selected={type} onChoose={chooseMealType} />
              </div>
            )}
            {step === 'capture' && <CaptureScreen />}
            {step === 'analyzing' && <AnalyzingView onCancel={cancelAnalysis} />}
            {step === 'review' && <ReviewScreen uid={me.uid} progress={base} />}
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
          finish()
        }}
      />
    </>
  )
}
