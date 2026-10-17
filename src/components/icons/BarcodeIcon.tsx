import { Icon } from './Icon'

export function BarcodeIcon({ size = 24, strokeWidth = 1.75 }: { size?: number; strokeWidth?: number }) {
  return (
    <Icon size={size} strokeWidth={strokeWidth}>
      <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
      <path d="M7 8v8M10.5 8v8M13.5 8v8M17 8v8" />
    </Icon>
  )
}
