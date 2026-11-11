import { Icon } from './Icon'

export function RotateIcon({ size = 20 }: { size?: number }) {
  return (
    <Icon size={size} strokeWidth={1.75}>
      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
    </Icon>
  )
}
