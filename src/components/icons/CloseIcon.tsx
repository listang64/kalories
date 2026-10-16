import { Icon } from './Icon'

export function CloseIcon({ size = 24 }: { size?: number }) {
  return (
    <Icon size={size}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Icon>
  )
}
