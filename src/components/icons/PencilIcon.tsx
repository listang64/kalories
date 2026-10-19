import { Icon } from './Icon'

export function PencilIcon({ size = 20 }: { size?: number }) {
  return (
    <Icon size={size}>
      <path d="M21.17 6.81a2.83 2.83 0 0 0-4-4L3.84 16.17a2 2 0 0 0-.5.83l-1.32 4.35a.5.5 0 0 0 .62.62l4.35-1.32a2 2 0 0 0 .83-.5Z" />
      <path d="m15 5 4 4" />
    </Icon>
  )
}
