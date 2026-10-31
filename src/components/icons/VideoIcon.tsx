import { Icon } from './Icon'

export function VideoIcon({ size = 24 }: { size?: number }) {
  return (
    <Icon size={size}>
      <rect x="2.5" y="6" width="13" height="12" rx="2.5" />
      <path d="m15.5 10.5 6-3.5v10l-6-3.5" />
    </Icon>
  )
}
