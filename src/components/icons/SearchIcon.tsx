import { Icon } from './Icon'

export function SearchIcon({ size = 24, strokeWidth = 1.75 }: { size?: number; strokeWidth?: number }) {
  return (
    <Icon size={size} strokeWidth={strokeWidth}>
      <circle cx="11" cy="11" r="7.5" />
      <path d="m20.5 20.5-4.2-4.2" />
    </Icon>
  )
}
