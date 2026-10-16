import { Icon } from './Icon'

export function DotsIcon({ size = 22 }: { size?: number }) {
  return (
    <Icon size={size} strokeWidth={2}>
      <circle cx="5" cy="12" r="0.6" />
      <circle cx="12" cy="12" r="0.6" />
      <circle cx="19" cy="12" r="0.6" />
    </Icon>
  )
}
