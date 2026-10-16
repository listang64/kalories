import { motion } from 'motion/react'
import { FluidOrb } from '../fluid/FluidOrb'

export function AnalyzingView({ onCancel }: { onCancel: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-9" aria-live="polite">
      <FluidOrb size={150} label="Analyse en cours" spin={4} />
      <div className="text-center">
        <motion.p
          className="text-[20px] font-semibold"
          animate={{ opacity: [1, 0.55, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          Analyse en cours…
        </motion.p>
        <p className="mt-1.5 text-[15px] text-text-2">Gemini reconnaît les aliments et estime les poids</p>
      </div>
      <button type="button" onClick={onCancel} className="h-10 px-4 text-[15px] text-text-2">
        Annuler
      </button>
    </div>
  )
}
