import type { ReactNode } from 'react'
import type { WeatherKind } from '../../lib/weather'
import { Icon } from './Icon'

const SUN = { stroke: 'var(--sun)' }
const RAIN = { stroke: 'var(--rain)' }
const CLOUD_TOP = 'M4 14.9A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.24'

const SHAPES: Record<WeatherKind, ReactNode> = {
  clear: (
    <g style={SUN}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </g>
  ),
  partly: (
    <>
      <path style={SUN} d="M12 2v2M4.93 4.93l1.41 1.41M20 12h2M19.07 4.93l-1.41 1.41M15.95 12.65a4 4 0 0 0-5.93-4.13" />
      <path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z" />
    </>
  ),
  cloudy: <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />,
  fog: (
    <>
      <path d={CLOUD_TOP} />
      <path d="M16 17H7M17 21H9" />
    </>
  ),
  drizzle: (
    <>
      <path d={CLOUD_TOP} />
      <path style={RAIN} d="M8 19v1M8 14v1M16 19v1M16 14v1M12 21v1M12 16v1" />
    </>
  ),
  rain: (
    <>
      <path d={CLOUD_TOP} />
      <path style={RAIN} d="M16 14v6M8 14v6M12 16v6" />
    </>
  ),
  snow: (
    <>
      <path d={CLOUD_TOP} />
      <path strokeWidth={2.5} d="M8 15h.01M8 19h.01M12 17h.01M12 21h.01M16 15h.01M16 19h.01" />
    </>
  ),
  storm: (
    <>
      <path d="M6 16.33A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.97" />
      <path style={SUN} d="m13 12-3 5h4l-3 5" />
    </>
  ),
}

export function WeatherIcon({ kind, size = 24 }: { kind: WeatherKind; size?: number }) {
  return (
    <Icon size={size} strokeWidth={1.75}>
      {SHAPES[kind]}
    </Icon>
  )
}
