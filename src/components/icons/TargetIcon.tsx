import { Icon } from './Icon'

export function TargetIcon({ size = 24 }: { size?: number }) {
  return (
    <Icon size={size}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.25" fill="currentColor" />
    </Icon>
  )
}
