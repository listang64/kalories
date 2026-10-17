import { useState, type FormEvent } from 'react'
import { COLORS, colorById, type ColorId } from '../../config/colors'
import { findInvite, joinHousehold, normalizeInviteCode, type Invite } from '../../lib/household'
import type { Profile } from '../../lib/profiles'
import { useAppStore } from '../../store/appStore'
import { BottomPanel } from '../BottomPanel'
import { ColorPicker } from '../ColorPicker'
import { FIELD_INPUT } from '../Field'
import { ProfileOrb } from '../ProfileOrb'

interface Props {
  open: boolean
  me: Profile
  onClose: () => void
}

const BUTTON = 'press h-13 w-full rounded-full bg-accent font-semibold text-black shadow-accent disabled:opacity-40'

const LOOKUP_ERRORS = {
  unknown: 'Code introuvable ou déjà utilisé',
  expired: 'Ce code a expiré : demande-en un nouveau',
  offline: 'Pas de connexion internet',
}

export function JoinPanel({ open, me, onClose }: Props) {
  return (
    <BottomPanel open={open} label="Rejoindre un foyer" onClose={onClose}>
      {open && <JoinForm me={me} onClose={onClose} />}
    </BottomPanel>
  )
}

function JoinForm({ me, onClose }: Omit<Props, 'open'>) {
  const [code, setCode] = useState('')
  const [invite, setInvite] = useState<Invite | null>(null)
  const [color, setColor] = useState<ColorId>(me.color)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const showToast = useAppStore((s) => s.showToast)
  const clash = invite !== null && invite.createdByColor === me.color

  const find = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    const result = await findInvite(code)
    setBusy(false)
    if (result.status !== 'found') return setError(LOOKUP_ERRORS[result.status])
    if (result.invite.createdBy === me.uid) return setError('C’est ton propre code d’invitation')
    setInvite(result.invite)
    if (result.invite.createdByColor === me.color) {
      setColor(COLORS.find((option) => option.id !== result.invite.createdByColor)?.id ?? me.color)
    }
  }

  const join = async (current: Invite) => {
    setBusy(true)
    setError(null)
    try {
      await joinHousehold(me, current, color)
      showToast(`Bienvenue dans le foyer de ${current.createdByName}`)
      onClose()
    } catch {
      setError('Impossible de rejoindre ce foyer : le code n’est peut-être plus valable')
      setBusy(false)
    }
  }

  if (!invite) {
    return (
      <form onSubmit={find} className="mt-4 flex flex-col gap-3">
        <h3 className="text-[17px] font-semibold">Rejoindre un foyer</h3>
        <p className="text-[15px] text-text-2">Entre le code à 6 caractères reçu de l’autre personne.</p>
        <input
          aria-label="Code d’invitation au foyer"
          value={code}
          onChange={(e) => {
            setCode(normalizeInviteCode(e.target.value))
            setError(null)
          }}
          placeholder="XXXXXX"
          autoCapitalize="characters"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="next"
          className={`${FIELD_INPUT} h-14 text-center font-mono text-[24px] tracking-[0.3em]`}
        />
        {error && (
          <p role="alert" className="px-1 text-sm text-accent">
            {error}
          </p>
        )}
        <button type="submit" disabled={code.length !== 6 || busy} className={`${BUTTON} mt-1`}>
          {busy ? 'Recherche…' : 'Continuer'}
        </button>
      </form>
    )
  }

  const host = colorById(invite.createdByColor)

  return (
    <div className="mt-4 flex flex-col gap-4">
      <div className="flex items-center gap-4 rounded-card border border-line bg-black/30 p-4">
        <ProfileOrb profile={host} size={44} />
        <span className="min-w-0">
          <span className="block truncate text-[19px] font-semibold">Foyer de {invite.createdByName}</span>
          <span className="text-[13px] text-text-2">Code {invite.code}</span>
        </span>
      </div>
      <p className="text-[15px] text-text-2">
        Ta liste de courses et tes prêts seront ajoutés aux siens, et vous verrez chacun les repas de l’autre.
      </p>
      {clash && (
        <div className="flex flex-col gap-2">
          <p className="text-[15px]">
            {invite.createdByName} est déjà en {host.label.toLowerCase()} : choisis une autre couleur.
          </p>
          <ColorPicker value={color} onChange={setColor} taken={[invite.createdByColor]} />
        </div>
      )}
      {error && (
        <p role="alert" className="px-1 text-sm text-accent">
          {error}
        </p>
      )}
      <button type="button" onClick={() => void join(invite)} disabled={busy} className={BUTTON}>
        {busy ? 'Un instant…' : 'Rejoindre le foyer'}
      </button>
    </div>
  )
}
