import { Icon } from './Icon'

export function DocumentIcon({ size = 20 }: { size?: number }) {
  return (
    <Icon size={size} strokeWidth={1.75}>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M8 13h8M8 17h5" />
    </Icon>
  )
}
