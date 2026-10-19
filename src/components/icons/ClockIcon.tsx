import { Icon } from './Icon'

export function ClockIcon({ size = 16 }: { size?: number }) {
  return (
    <Icon size={size} strokeWidth={1.75}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </Icon>
  )
}
