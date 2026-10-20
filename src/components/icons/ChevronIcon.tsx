import { Icon } from './Icon'

const PATHS = { right: 'M9 6l6 6-6 6', left: 'M15 6l-6 6 6 6', up: 'M6 15l6-6 6 6', down: 'M6 9l6 6 6-6' }

export function ChevronIcon({ size = 20, direction = 'right' }: { size?: number; direction?: keyof typeof PATHS }) {
  return (
    <Icon size={size}>
      <path d={PATHS[direction]} />
    </Icon>
  )
}
