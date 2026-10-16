import { Icon } from './Icon'

export function ChevronIcon({ size = 20, direction = 'right' }: { size?: number; direction?: 'left' | 'right' }) {
  return (
    <Icon size={size}>
      <path d={direction === 'right' ? 'M9 6l6 6-6 6' : 'M15 6l-6 6 6 6'} />
    </Icon>
  )
}
