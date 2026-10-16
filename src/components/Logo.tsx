import { KaloriesMark } from './icons/KaloriesMark'

export function Logo({ size = 96 }: { size?: number }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <KaloriesMark size={size} />
      <span className="text-[34px] font-semibold tracking-[-0.03em] text-accent">Kalories</span>
    </div>
  )
}
