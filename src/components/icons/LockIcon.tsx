import { Icon } from './Icon'

export function LockIcon({ size = 20, open = false }: { size?: number; open?: boolean }) {
  return (
    <Icon size={size} strokeWidth={1.75}>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d={open ? 'M7 11V7a5 5 0 0 1 9.9-1' : 'M7 11V7a5 5 0 0 1 10 0v4'} />
    </Icon>
  )
}
