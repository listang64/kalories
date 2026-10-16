import { Icon } from './Icon'

export function CheckIcon({ size = 24, strokeWidth = 2 }: { size?: number; strokeWidth?: number }) {
  return (
    <Icon size={size} strokeWidth={strokeWidth}>
      <path d="M20 6 9 17l-5-5" />
    </Icon>
  )
}
