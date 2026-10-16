import type { Profile } from '../config/users'

export function ProfileOrb({ profile, size = 56 }: { profile: Profile; size?: number }) {
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
