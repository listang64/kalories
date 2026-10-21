import { motion } from 'motion/react'
import { ChevronIcon } from '../icons/ChevronIcon'
import { Icon } from '../icons/Icon'

export function NeedsBanner({ onPress }: { onPress: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onPress}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="press mt-3 flex min-h-11 w-full items-center gap-2.5 rounded-full bg-accent py-1.5 pr-3 pl-1.5 text-[min(15px,4.3vw)] leading-tight font-semibold text-black shadow-accent"
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-black/15">
        <Icon size={18} strokeWidth={2.25}>
          <path d="M12 7v6M12 17h.01" />
        </Icon>
      </span>
      <span className="min-w-0 flex-1 text-left">Calcule tes besoins quotidiens</span>
      <ChevronIcon size={18} />
    </motion.button>
  )
}
