import { useState, type FormEvent } from 'react'
import { createSignupCode, shareSignupCode } from '../../lib/signupCodes'
import { useAppStore } from '../../store/appStore'
import { BottomPanel } from '../BottomPanel'
import { Field, FIELD_INPUT } from '../Field'

interface Props {
  open: boolean
  onClose: () => void
}

export function CodeCreator({ open, onClose }: Props) {
  return (
    <BottomPanel open={open} label="Nouveau code d’inscription" onClose={onClose}>
      {open && <CreatorForm onClose={onClose} />}
    </BottomPanel>
  )
}

function CreatorForm({ onClose }: { onClose: () => void }) {
  const [label, setLabel] = useState('')
  const [code, setCode] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const showToast = useAppStore((s) => s.showToast)

  const create = async (event: FormEvent) => {
    event.preventDefault()
    if (!label.trim() || busy) return
    setBusy(true)
    try {
      setCode(await createSignupCode(label))
    } catch {
      showToast('Création impossible pour l’instant')
    }
    setBusy(false)
  }

  const share = async (id: string) => {
    const result = await shareSignupCode(id).catch(() => null)
    if (result === 'copied') showToast('Invitation copiée')
    if (result !== 'cancelled' && result !== null) onClose()
  }

  if (code) {
    return (
      <div className="mt-4 flex flex-col items-center gap-2 text-center">
        <h3 className="text-[17px] font-semibold">Code pour {label.trim()}</h3>
        <p className="my-3 font-mono text-[34px] font-semibold tracking-[0.12em] text-accent select-all">{code}</p>
        <p className="max-w-72 text-[13px] text-text-2">Il ne sert qu’une fois. Envoie l’invitation, tout est expliqué dedans.</p>
        <button
          type="button"
          onClick={() => void share(code)}
          className="press mt-3 h-13 w-full rounded-full bg-accent font-semibold text-black shadow-accent"
        >
          Envoyer l’invitation
        </button>
        <button type="button" onClick={onClose} className="h-11 w-full text-[15px] text-text-2">
          Terminé
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={create} className="mt-4 flex flex-col gap-3">
      <h3 className="text-[17px] font-semibold">Nouveau code d’inscription</h3>
      <Field label="Pour qui ?">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          maxLength={40}
          placeholder="ex. Maman, Julie du travail"
          autoCapitalize="sentences"
          enterKeyHint="done"
          className={FIELD_INPUT}
        />
      </Field>
      <button
        type="submit"
        disabled={!label.trim() || busy}
        className="press mt-2 h-13 w-full rounded-full bg-accent font-semibold text-black shadow-accent disabled:opacity-40"
      >
        {busy ? 'Création…' : 'Créer le code'}
      </button>
    </form>
  )
}
