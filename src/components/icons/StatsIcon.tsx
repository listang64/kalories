import { Icon } from './Icon'

export function StatsIcon({ size = 24 }: { size?: number }) {
  return (
    <Icon size={size}>
      <path d="M3 3v16a2 2 0 0 0 2 2h16" />
      <path d="M8 17v-4M13 17V7M18 17v-7" />
    </Icon>
  )
}
