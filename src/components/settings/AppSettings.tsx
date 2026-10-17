import { useState } from 'react'
import { auth } from '../../config/firebase'
import { signOutUser } from '../../lib/auth'
import { formatBuildDate } from '../../lib/format'
import type { Profile } from '../../lib/profiles'
import { saveSettings } from '../../lib/profiles'
import { applyUpdate, checkForUpdate, type UpdateCheck } from '../../lib/pwa'
import { useAppStore } from '../../store/appStore'
import { ColorPicker } from '../ColorPicker'
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

interface Props {
  me: Profile
  partner: Profile | null
}

export function AppSettings({ me, partner }: Props) {
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
      <SettingsGroup
        title="Profil connecté"
        footer={partner ? `La couleur de ${partner.name} est grisée : chacun garde la sienne.` : undefined}
      >
        <SettingsRow>
          <ProfileOrb profile={me} size={28} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[17px] font-semibold">{me.name}</span>
            <span className="block truncate text-[13px] text-text-2">{auth.currentUser?.email}</span>
          </span>
          <button type="button" onClick={signOut} className="text-[15px] text-accent">
            Se déconnecter
          </button>
        </SettingsRow>
        <div className="px-3 py-3">
          <ColorPicker
            value={me.color}
            onChange={(color) => saveSettings(me.uid, { color })}
            taken={partner ? [partner.color] : []}
          />
        </div>
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
            Open-Meteo
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
