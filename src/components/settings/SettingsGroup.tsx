import type { ReactNode } from 'react'

interface GroupProps {
  title: string
  footer?: ReactNode
  children: ReactNode
}

export function SettingsGroup({ title, footer, children }: GroupProps) {
  return (
    <section>
      <h3 className="label mb-2 px-1">{title}</h3>
      <div className="divide-y divide-line overflow-hidden rounded-card border border-line bg-surface-2">
        {children}
      </div>
      {footer && <p className="mt-2 px-1 text-[13px] leading-snug text-text-2">{footer}</p>}
    </section>
  )
}

export function SettingsRow({ children }: { children: ReactNode }) {
  return <div className="flex min-h-13 items-center gap-3 px-4 py-2">{children}</div>
}
