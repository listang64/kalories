import { PhoneIcon } from './icons/PhoneIcon'

export function RotateNotice() {
  return (
    <div className="fixed inset-0 z-[100] hidden flex-col items-center justify-center gap-3 bg-bg px-8 text-center [@media(orientation:landscape)_and_(max-height:540px)]:flex">
      <span className="turn-phone text-accent">
        <PhoneIcon size={48} />
      </span>
      <p className="mt-2 text-[17px] font-semibold">Tourne ton téléphone</p>
      <p className="text-[15px] text-text-2">Kalories s’utilise en mode portrait.</p>
    </div>
  )
}
