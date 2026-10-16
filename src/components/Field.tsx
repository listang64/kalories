import type { ReactNode } from 'react'

export const FIELD_INPUT =
  'mt-1.5 block h-12 w-full appearance-none rounded-card border border-line bg-black/30 px-4 text-left text-base outline-none placeholder:text-text-2 focus:border-white/20'

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="label px-1">{label}</span>
      {children}
    </label>
  )
}
