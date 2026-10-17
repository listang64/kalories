import { useState } from 'react'
import { cancelInvite, createInvite, formatExpiry, shareHouseholdInvite, type Invite } from '../../lib/household'
import type { Profile } from '../../lib/profiles'
import { useAppStore } from '../../store/appStore'
import { BottomPanel } from '../BottomPanel'

interface Props {
  open: boolean
  me: Profile
  invite: Invite | null
  onClose: () => void
}

const BUTTON = 'press mt-3 h-13 w-full rounded-full bg-accent font-semibold text-black shadow-accent disabled:opacity-40'

export function InvitePanel({ open, me, invite, onClose }: Props) {
  const [busy, setBusy] = useState(false)
  const showToast = useAppStore((s) => s.showToast)
  const fail = () => showToast('Action impossible pour l’instant')

  const create = async () => {
    setBusy(true)
    await createInvite(me).catch(fail)
    setBusy(false)
  }

  const share = async (current: Invite) => {
    if ((await shareHouseholdInvite(current).catch(() => null)) === 'copied') showToast('Invitation copiée')
  }

  return (
    <BottomPanel open={open} label="Inviter dans mon foyer" onClose={onClose}>
      {invite ? (
        <div className="mt-4 flex flex-col items-center gap-2 text-center">
          <h3 className="text-[17px] font-semibold">Code d’invitation</h3>
          <p className="my-3 font-mono text-[40px] font-semibold tracking-[0.2em] text-accent select-all">{invite.code}</p>
          <p className="max-w-72 text-[13px] text-text-2">Valable jusqu’au {formatExpiry(invite.expiresAt)}.</p>
          <button type="button" onClick={() => void share(invite)} className={BUTTON}>
            Envoyer l’invitation
          </button>
          <button
            type="button"
            onClick={() => cancelInvite(invite.code).catch(fail)}
            className="h-11 w-full text-[15px] text-text-2"
          >
            Annuler l’invitation
          </button>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-2">
          <h3 className="text-[17px] font-semibold">Inviter dans mon foyer</h3>
          <p className="text-[15px] text-text-2">
            La personne doit déjà avoir un compte Kalories. Elle entrera le code dans Paramètres, Mon foyer, Rejoindre
            un foyer. Le code reste valable 48 h.
          </p>
          <button type="button" onClick={() => void create()} disabled={busy} className={BUTTON}>
            {busy ? 'Création…' : 'Créer un code d’invitation'}
          </button>
        </div>
      )}
    </BottomPanel>
  )
}
