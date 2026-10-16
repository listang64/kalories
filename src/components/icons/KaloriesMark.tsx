import { useId } from 'react'

const LEFT_ARC = 'M217.2 400.9A150 150 0 0 1 217.2 111.1'
const RIGHT_ARC = 'M294.8 111.1A150 150 0 0 1 294.8 400.9'

export function KaloriesMark({ size = 96 }: { size?: number }) {
  const id = useId()
  const nico = `${id}n`
  const chachou = `${id}c`
  const orb = `${id}o`
  const shine = `${id}s`
  const glow = `${id}g`

  return (
    <svg width={size} height={size} viewBox="0 0 512 512" aria-hidden="true">
      <defs>
        <linearGradient id={nico} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="var(--nico)" />
          <stop offset="1" stopColor="var(--nico-2)" />
        </linearGradient>
        <linearGradient id={chachou} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="var(--chachou)" />
          <stop offset="1" stopColor="var(--chachou-2)" />
        </linearGradient>
        <linearGradient id={orb} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a35cf5" />
          <stop offset="0.55" stopColor="#b02a8c" />
          <stop offset="1" stopColor="var(--chachou-2)" />
        </linearGradient>
        <radialGradient id={shine} cx="0.36" cy="0.3" r="0.42">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <filter id={glow} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
      </defs>
      <g filter={`url(#${glow})`} opacity="0.5">
        <path d={LEFT_ARC} stroke={`url(#${nico})`} strokeWidth="44" strokeLinecap="round" fill="none" />
        <path d={RIGHT_ARC} stroke={`url(#${chachou})`} strokeWidth="44" strokeLinecap="round" fill="none" />
      </g>
      <path d={LEFT_ARC} stroke={`url(#${nico})`} strokeWidth="44" strokeLinecap="round" fill="none" />
      <path d={RIGHT_ARC} stroke={`url(#${chachou})`} strokeWidth="44" strokeLinecap="round" fill="none" />
      <circle cx="256" cy="256" r="86" fill={`url(#${orb})`} />
      <circle cx="256" cy="256" r="86" fill={`url(#${shine})`} />
      <circle cx="256" cy="256" r="85" fill="none" stroke="#fff" strokeOpacity="0.14" strokeWidth="2" />
    </svg>
  )
}
