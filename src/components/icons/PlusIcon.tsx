import { Icon } from './Icon'

export function PlusIcon({ size = 24, strokeWidth = 1.5 }: { size?: number; strokeWidth?: number }) {
  return (
    <Icon size={size} strokeWidth={strokeWidth}>
      <path d="M12 5v14M5 12h14" />
    </Icon>
  )
}
