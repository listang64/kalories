import { Icon } from './Icon'

export function FlipIcon({ size = 20 }: { size?: number }) {
  return (
    <Icon size={size} strokeWidth={1.75}>
      <path d="M8 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h3" />
      <path d="M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3" />
      <path d="M12 2v2M12 8v2M12 14v2M12 20v2" />
    </Icon>
  )
}
