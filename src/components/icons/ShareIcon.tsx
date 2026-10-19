import { Icon } from './Icon'

export function ShareIcon({ size = 20 }: { size?: number }) {
  return (
    <Icon size={size} strokeWidth={1.75}>
      <path d="M12 3v12" />
      <path d="m8 7 4-4 4 4" />
      <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
    </Icon>
  )
}
