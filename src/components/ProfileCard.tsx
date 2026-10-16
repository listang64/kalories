import { motion } from 'motion/react'
import type { Profile } from '../config/users'
import { ProfileOrb } from './ProfileOrb'

interface Props {
  profile: Profile
  selected: boolean
  dimmed: boolean
  onSelect: () => void
}

export function ProfileCard({ profile, selected, dimmed, onSelect }: Props) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      animate={{ opacity: dimmed ? 0.4 : 1, scale: dimmed ? 0.96 : 1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 420, damping: 30 }}
      className="relative flex h-40 flex-1 flex-col items-center justify-center gap-4 overflow-hidden rounded-card border bg-surface"
      style={{ borderColor: selected ? `${profile.colorB}80` : 'var(--line)' }}
    >
      <span
        aria-hidden="true"
        className="absolute inset-x-0 -bottom-12 h-36 blur-2xl"
        style={{ background: `radial-gradient(closest-side, ${profile.colorA}90, transparent)` }}
      />
      <ProfileOrb profile={profile} size={56} />
      <span className="relative text-lg font-semibold">{profile.name}</span>
    </motion.button>
  )
}
