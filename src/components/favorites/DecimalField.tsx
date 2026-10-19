interface Props {
  label: string
  unit: string
  value: string
  onChange: (value: string) => void
}

function clean(text: string): string {
  const [whole = '', ...rest] = text.replace(/\./g, ',').replace(/[^\d,]/g, '').split(',')
  return rest.length ? `${whole.slice(0, 3)},${rest.join('').slice(0, 1)}` : whole.slice(0, 3)
}

export function DecimalField({ label, unit, value, onChange }: Props) {
  return (
    <label className="block rounded-card border border-line bg-surface-2 px-3.5 py-2.5 focus-within:border-white/20">
      <span className="block text-[13px] text-text-2">{label}</span>
      <span className="mt-0.5 flex items-baseline gap-1.5">
        <input
          inputMode="decimal"
          enterKeyHint="done"
          placeholder="0"
          value={value}
          onChange={(e) => onChange(clean(e.target.value))}
          onFocus={(e) => e.target.select()}
          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
          className="w-full min-w-0 bg-transparent text-[20px] font-semibold tabular-nums outline-none placeholder:text-white/20"
        />
        <span className="text-[14px] text-text-2">{unit}</span>
      </span>
    </label>
  )
}
