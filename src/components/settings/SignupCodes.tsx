import { useState } from 'react'
import { useSignupCodes } from '../../hooks/useSignupCodes'
import { deleteSignupCode, shareInvite, type SignupCode } from '../../lib/signupCodes'
import { useAppStore } from '../../store/appStore'
import { ActionSheet, type SheetAction } from '../ActionSheet'
import { CodeCreator } from './CodeCreator'
import { SettingsGroup, SettingsRow } from './SettingsGroup'

export function SignupCodes() {
  const codes = useSignupCodes()
  const [creating, setCreating] = useState(false)
  const [selected, setSelected] = useState<SignupCode | null>(null)
  const showToast = useAppStore((s) => s.showToast)

  const share = async (id: string) => {
    if ((await shareInvite(id).catch(() => null)) === 'copied') showToast('Invitation copiée')
  }

  const actions = (code: SignupCode): SheetAction[] => [
    ...(code.usedName
      ? []
      : [
          { label: 'Envoyer l’invitation', onSelect: () => void share(code.id) },
          {
            label: 'Copier le code',
            onSelect: () =>
              void navigator.clipboard.writeText(code.id).then(
                () => showToast('Code copié'),
                () => showToast('Copie impossible'),
              ),
          },
        ]),
    {
      label: 'Supprimer',
      tone: 'danger',
      onSelect: () => deleteSignupCode(code.id).catch(() => showToast('Suppression impossible')),
    },
  ]

  return (
    <>
      <SettingsGroup title="Inscriptions" footer="Un code par personne : il ne sert qu’une fois.">
        <SettingsRow>
          <button type="button" onClick={() => setCreating(true)} className="flex-1 text-left text-[17px] text-accent">
            Nouveau code d’inscription
          </button>
        </SettingsRow>
        {codes.map((code) => (
          <SettingsRow key={code.id}>
            <button type="button" onClick={() => setSelected(code)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[17px]">{code.label || 'Sans nom'}</span>
                <span className="block font-mono text-[13px] text-text-2">{code.id}</span>
              </span>
              <span className={`shrink-0 text-[13px] ${code.usedName ? 'text-text-2' : 'text-accent'}`}>
                {code.usedName ? `Utilisé par ${code.usedName}` : 'Libre'}
              </span>
            </button>
          </SettingsRow>
        ))}
      </SettingsGroup>
      <CodeCreator open={creating} onClose={() => setCreating(false)} />
      <ActionSheet
        open={selected !== null}
        title={selected ? `${selected.label} · ${selected.id}` : ''}
        actions={selected ? actions(selected) : []}
        onClose={() => setSelected(null)}
      />
    </>
  )
}
