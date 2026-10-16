import { Icon } from './Icon'

export function PhoneIcon({ size = 24, strokeWidth = 1.5 }: { size?: number; strokeWidth?: number }) {
  return (
    <Icon size={size} strokeWidth={strokeWidth}>
      <rect width="14" height="20" x="5" y="2" rx="2.5" />
      <path d="M11 18h2" />
    </Icon>
  )
}
