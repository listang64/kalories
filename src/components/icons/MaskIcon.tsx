import { Icon } from './Icon'

export function MaskIcon({ size = 24 }: { size?: number }) {
  return (
    <Icon size={size}>
      <path d="M3 5c3 1.2 6 1.2 9 0s6-1.2 9 0v5c0 5-4 9-9 9s-9-4-9-9Z" />
      <path d="M7.5 10.5c.8-.7 1.7-.7 2.5 0M14 10.5c.8-.7 1.7-.7 2.5 0M9 15c1.8 1.2 4.2 1.2 6 0" />
    </Icon>
  )
}
