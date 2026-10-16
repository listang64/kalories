import type { ReactNode } from 'react'

interface Props {
  size?: number
  strokeWidth?: number
  className?: string
  children: ReactNode
}

export function Icon({ size = 24, strokeWidth = 1.5, className, children }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  )
}
