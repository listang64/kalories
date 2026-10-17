import { motion } from 'motion/react'

const CORNER = 'absolute size-7 border-accent'

export function ScanFrame({ square = false, hint }: { square?: boolean; hint: string }) {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div
        className={`relative rounded-[14px] shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] ${square ? 'aspect-square w-[70%]' : 'aspect-[16/9] w-[80%]'}`}
      >
        <span className={`${CORNER} top-0 left-0 rounded-tl-[14px] border-t-[3px] border-l-[3px]`} />
        <span className={`${CORNER} top-0 right-0 rounded-tr-[14px] border-t-[3px] border-r-[3px]`} />
        <span className={`${CORNER} bottom-0 left-0 rounded-bl-[14px] border-b-[3px] border-l-[3px]`} />
        <span className={`${CORNER} right-0 bottom-0 rounded-br-[14px] border-r-[3px] border-b-[3px]`} />
        <motion.span
          className="absolute inset-x-4 h-0.5 rounded-full bg-accent shadow-[0_0_12px_rgba(255,122,26,0.9)]"
          initial={{ top: '12%' }}
          animate={{ top: ['12%', '88%', '12%'] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
      <p className="absolute inset-x-0 bottom-5 text-center text-[15px] text-white/85">{hint}</p>
    </div>
  )
}
