import { AppVersion } from '../components/AppVersion'
import { ProfileOrb } from '../components/ProfileOrb'
import type { Profile } from '../config/users'
import { signOutUser } from '../hooks/useAuth'
import { useAppStore } from '../store/appStore'

export function SettingsScreen({ profile }: { profile: Profile }) {
  const setOverlay = useAppStore((s) => s.setOverlay)

  const signOut = () => {
    setOverlay(null)
    void signOutUser()
  }

  return (
    <div className="flex flex-col gap-8 pt-2">
      <section>
        <p className="label mb-2">Profil connecté</p>
        <div className="flex items-center gap-3 rounded-card border border-line bg-surface-2 p-4">
          <ProfileOrb profile={profile} size={36} />
          <span className="flex-1 text-[17px] font-semibold">{profile.name}</span>
          <button type="button" onClick={signOut} className="h-9 rounded-full px-3 text-[15px] text-accent">
            Se déconnecter
          </button>
        </div>
      </section>
      <AppVersion className="text-center" />
    </div>
  )
}
