import type { ComponentType } from 'react'
import { CENTER, SCALE_MAX, SCALE_MIN, clampScale, useTraceStore, wrapAngle } from '../../lib/trace/store'
import { ChevronIcon } from '../icons/ChevronIcon'
import { ContrastIcon } from '../icons/ContrastIcon'
import { FlipIcon } from '../icons/FlipIcon'
import { FocusIcon } from '../icons/FocusIcon'
import { GalleryIcon } from '../icons/GalleryIcon'
import { RotateIcon } from '../icons/RotateIcon'

interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  suffix: string
  onChange: (value: number) => void
}

function Slider({ label, value, min, max, suffix, onChange }: SliderProps) {
  return (
    <label className="flex h-11 items-center gap-3">
      <span className="w-[72px] shrink-0 text-[14px] text-text-2">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-7 min-w-0 flex-1 accent-accent"
      />
      <span className="w-12 shrink-0 text-right text-[14px] font-semibold tabular-nums">
        {value}
        {suffix}
      </span>
    </label>
  )
}

function Tool({ label, Icon, active = false, onClick }: { label: string; Icon: ComponentType<{ size?: number }>; active?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`press flex h-15 min-w-0 flex-col items-center justify-center gap-1 rounded-xl text-[min(11px,3.2vw)] font-medium ${active ? 'bg-accent text-black' : 'bg-white/10 text-text'}`}
    >
      <Icon size={20} />
      <span className="max-w-full whitespace-nowrap">{label}</span>
    </button>
  )
}

export function TracePanel({ onPick, onHide }: { onPick: () => void; onHide: () => void }) {
  const { placement, opacity, mirror, contrast, place, set } = useTraceStore()

  return (
    <div className="absolute inset-x-0 bottom-0 z-10 rounded-t-sheet border-t border-line bg-black/80 px-4 pb-[calc(var(--safe-bottom)+12px)] backdrop-blur-md">
      <button type="button" aria-label="Masquer les réglages" onClick={onHide} className="mx-auto grid h-8 w-16 place-items-center text-text-2">
        <ChevronIcon size={22} direction="down" />
      </button>
      <Slider label="Opacité" value={Math.round(opacity * 100)} min={5} max={100} suffix="%" onChange={(value) => set({ opacity: value / 100 })} />
      <Slider
        label="Taille"
        value={Math.round(placement.scale * 100)}
        min={SCALE_MIN * 100}
        max={SCALE_MAX * 100}
        suffix="%"
        onChange={(value) => place({ ...placement, scale: clampScale(value / 100) })}
      />
      <Slider
        label="Rotation"
        value={Math.round(placement.rotation)}
        min={-180}
        max={180}
        suffix="°"
        onChange={(value) => place({ ...placement, rotation: value })}
      />
      <div className="mt-2 grid grid-cols-5 gap-1.5">
        <Tool label="Image" Icon={GalleryIcon} onClick={onPick} />
        <Tool label="Miroir" Icon={FlipIcon} active={mirror} onClick={() => set({ mirror: !mirror })} />
        <Tool label="Contraste" Icon={ContrastIcon} active={contrast} onClick={() => set({ contrast: !contrast })} />
        <Tool label="Pivoter" Icon={RotateIcon} onClick={() => place({ ...placement, rotation: wrapAngle(placement.rotation + 90) })} />
        <Tool label="Centrer" Icon={FocusIcon} onClick={() => place({ ...CENTER, rotation: placement.rotation })} />
      </div>
    </div>
  )
}
