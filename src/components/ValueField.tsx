interface Props {
  label: string
  unit: string
  value: string
  onChange: (value: string) => void
  decimals?: boolean
  digits?: number
  placeholder?: string
}

function clean(text: string, decimals: boolean, digits: number): string {
  const [whole = '', ...rest] = text.replace(/\./g, ',').replace(/[^\d,]/g, '').split(',')
  return decimals && rest.length ? `${whole.slice(0, digits)},${rest.join('').slice(0, 1)}` : whole.slice(0, digits)
}

export function ValueField({ label, unit, value, onChange, decimals = true, digits = 3, placeholder = '0' }: Props) {
  return (
    <label className="block rounded-card border border-line bg-surface-2 px-3.5 py-2.5 focus-within:border-white/20">
      <span className="block text-[13px] text-text-2">{label}</span>
      <span className="mt-0.5 flex items-baseline gap-1.5">
        <input
          inputMode={decimals ? 'decimal' : 'numeric'}
          enterKeyHint="done"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(clean(e.target.value, decimals, digits))}
          onFocus={(e) => e.target.select()}
          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
          className="w-full min-w-0 bg-transparent text-[20px] font-semibold tabular-nums outline-none placeholder:text-white/20"
        />
        <span className="text-[14px] text-text-2">{unit}</span>
      </span>
    </label>
  )
}
