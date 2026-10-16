import { useState } from 'react'
import type { Profile } from '../../config/users'
import { signOutUser } from '../../hooks/useAuth'
import { formatBuildDate } from '../../lib/format'
import { applyUpdate, checkForUpdate, type UpdateCheck } from '../../lib/pwa'
import { WEATHER_PLACE } from '../../lib/weather'
import { useAppStore } from '../../store/appStore'
import { ProfileOrb } from '../ProfileOrb'
import { SettingsGroup, SettingsRow } from './SettingsGroup'

type CheckState = UpdateCheck | 'checking'

const CHECK_LABEL: Record<CheckState, string> = {
  checking: 'Vérification…',
  found: 'Téléchargement…',
  current: 'Kalories est à jour',
  offline: 'Hors ligne',
  unsupported: 'Indisponible ici',
}

export function AppSettings({ profile }: { profile: Profile }) {
  const setOverlay = useAppStore((s) => s.setOverlay)
  const updateReady = useAppStore((s) => s.updateReady)
  const [check, setCheck] = useState<CheckState | null>(null)

  const signOut = () => {
    setOverlay(null)
    void signOutUser()
  }

  const verify = async () => {
    setCheck('checking')
    setCheck(await checkForUpdate())
  }

  return (
    <>
      <SettingsGroup title="Profil connecté">
        <SettingsRow>
          <ProfileOrb profile={profile} size={28} />
          <span className="flex-1 text-[17px] font-semibold">{profile.name}</span>
          <button type="button" onClick={signOut} className="text-[15px] text-accent">
            Se déconnecter
          </button>
        </SettingsRow>
      </SettingsGroup>
      <SettingsGroup title="Application">
        <SettingsRow>
          <span className="flex-1 text-[17px]">Version</span>
          <span className="font-mono text-[15px] text-text-2">{__APP_VERSION__}</span>
        </SettingsRow>
        <SettingsRow>
          <span className="flex-1 text-[17px]">Mise en ligne</span>
          <span className="text-[15px] text-text-2">{formatBuildDate(__BUILD_DATE__)}</span>
        </SettingsRow>
        <SettingsRow>
          <span className="flex-1 text-[17px]">Météo</span>
          <a href="https://open-meteo.com/" target="_blank" rel="noreferrer" className="text-[15px] text-text-2">
            Open-Meteo · {WEATHER_PLACE}
          </a>
        </SettingsRow>
        <SettingsRow>
          {updateReady ? (
            <button type="button" onClick={applyUpdate} className="flex-1 text-left text-[17px] font-semibold text-accent">
              Installer la mise à jour
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void verify()}
              disabled={check === 'checking'}
              className="flex-1 text-left text-[17px] text-accent"
            >
              Vérifier les mises à jour
            </button>
          )}
          {!updateReady && check && <span className="text-[15px] text-text-2">{CHECK_LABEL[check]}</span>}
        </SettingsRow>
      </SettingsGroup>
    </>
  )
}
