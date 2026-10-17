import { useState } from 'react'
import { leaveHousehold, useMyInvite } from '../../lib/household'
import type { Profile } from '../../lib/profiles'
import { useAppStore } from '../../store/appStore'
import { ConfirmDialog } from '../ConfirmDialog'
import { ProfileOrb } from '../ProfileOrb'
import { InvitePanel } from './InvitePanel'
import { JoinPanel } from './JoinPanel'
import { SettingsGroup, SettingsRow } from './SettingsGroup'

interface Props {
  me: Profile
  people: Profile[]
}

const ACTION = 'flex-1 text-left text-[17px] text-accent'

export function HouseholdSettings({ me, people }: Props) {
  const partner = people.find((person) => person.uid !== me.uid) ?? null
  const invite = useMyInvite(me.uid)
  const [panel, setPanel] = useState<'invite' | 'join' | null>(null)
  const [leaving, setLeaving] = useState(false)
  const showToast = useAppStore((s) => s.showToast)

  const leave = () => {
    setLeaving(false)
    leaveHousehold(me).then(
      () => showToast('Tu as quitté le foyer'),
      () => showToast('Action impossible pour l’instant'),
    )
  }

  return (
    <>
      <SettingsGroup
        title="Mon foyer"
        footer={
          partner
            ? 'Vous partagez la liste de courses et les prêts, et chacun voit les repas de l’autre.'
            : 'Invite une personne pour partager la liste de courses, les prêts et vos journées.'
        }
      >
        {people.map((person) => (
          <SettingsRow key={person.uid}>
            <ProfileOrb profile={person} size={22} />
            <span className="flex-1 text-[17px]">{person.name}</span>
            {person.uid === me.uid && <span className="text-[15px] text-text-2">toi</span>}
          </SettingsRow>
        ))}
        {partner ? (
          <SettingsRow>
            <button type="button" onClick={() => setLeaving(true)} className={ACTION}>
              Quitter le foyer
            </button>
          </SettingsRow>
        ) : (
          <>
            <SettingsRow>
              <button type="button" onClick={() => setPanel('invite')} className={ACTION}>
                Inviter quelqu’un
              </button>
              {invite && <span className="font-mono text-[15px] text-text-2">{invite.code}</span>}
            </SettingsRow>
            <SettingsRow>
              <button type="button" onClick={() => setPanel('join')} className={ACTION}>
                Rejoindre un foyer
              </button>
            </SettingsRow>
          </>
        )}
      </SettingsGroup>
      <InvitePanel open={panel === 'invite' && !partner} me={me} invite={invite} onClose={() => setPanel(null)} />
      <JoinPanel open={panel === 'join' && !partner} me={me} onClose={() => setPanel(null)} />
      <ConfirmDialog
        open={leaving}
        title="Quitter le foyer ?"
        message={`Tu repars avec ton propre foyer. La liste de courses et les prêts restent à ${partner?.name ?? 'l’autre'}.`}
        confirmLabel="Quitter"
        cancelLabel="Rester"
        onCancel={() => setLeaving(false)}
        onConfirm={leave}
      />
    </>
  )
}
