import type { ReactNode } from 'react'

interface Props {
  title: string
  footer?: ReactNode
  children: ReactNode
}

export function NeedsSection({ title, footer, children }: Props) {
  return (
    <section>
      <h3 className="label mb-2 px-1">{title}</h3>
      {children}
      {footer && <p className="mt-2 px-1 text-[13px] leading-snug text-text-2">{footer}</p>}
    </section>
  )
}
