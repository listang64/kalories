import type { PersonColor } from '../config/colors'

interface Props {
  profile: Pick<PersonColor, 'colorA' | 'colorB'>
  size?: number
}

export function ProfileOrb({ profile, size = 56 }: Props) {
  return (
    <span
      aria-hidden="true"
      className="relative block shrink-0 rounded-full"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 34% 28%, rgba(255,255,255,0.7) 0, ${profile.colorB} 30%, ${profile.colorA} 78%)`,
        boxShadow: `0 0 ${size / 2}px ${profile.colorA}99, inset 0 0 0 1px rgba(255,255,255,0.14)`,
      }}
    />
  )
}
