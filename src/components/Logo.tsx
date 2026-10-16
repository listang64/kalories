import { KaloriesMark } from './icons/KaloriesMark'

export function Logo({ size = 96 }: { size?: number }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <KaloriesMark size={size} />
      <h1 className="text-[34px] font-semibold tracking-[-0.03em] text-accent">Kalories</h1>
    </div>
  )
}
