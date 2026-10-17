import { useState, type FormEvent } from 'react'
import { FirebaseError } from 'firebase/app'
import type { User } from 'firebase/auth'
import { ColorPicker } from '../components/ColorPicker'
import { Field, FIELD_INPUT } from '../components/Field'
import { ChevronIcon } from '../components/icons/ChevronIcon'
import { NumberField } from '../components/NumberField'
import { ProfileOrb } from '../components/ProfileOrb'
import { colorById, type ColorId } from '../config/colors'
import { authErrorMessage } from '../lib/auth'
import { DEFAULT_KCAL } from '../lib/profiles'
import { checkSignupCode, createProfile, normalizeCode, signUp, type CodeCheck } from '../lib/signup'

interface Props {
  account: User | null
  onBack: () => void
}

const CODE_ERRORS: Record<Exclude<CodeCheck, 'ok'>, string> = {
  unknown: 'Code inconnu : vérifie-le avec la personne qui te l’a donné',
  used: 'Ce code a déjà servi : demande-en un nouveau',
  offline: 'Pas de connexion internet',
}

const BUTTON = 'press h-13 w-full rounded-full bg-accent font-semibold text-black shadow-accent disabled:opacity-40'

function errorMessage(error: unknown): string {
  if (error instanceof FirebaseError && error.code === 'permission-denied') return 'Ce code n’est plus valable'
  if (error instanceof FirebaseError && error.code.startsWith('auth/')) return authErrorMessage(error)
  return 'Inscription impossible pour l’instant'
}

export function SignupScreen({ account, onBack }: Props) {
  const [step, setStep] = useState<'code' | 'profile'>('code')
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [color, setColor] = useState<ColorId>('violet')
  const [kcal, setKcal] = useState(DEFAULT_KCAL)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const ready = name.trim() !== '' && (account !== null || (email.trim() !== '' && password.length >= 6))

  const checkCode = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    const result = await checkSignupCode(code)
    setBusy(false)
    if (result === 'ok') setStep('profile')
    else setError(CODE_ERRORS[result])
  }

  const create = async (event: FormEvent) => {
    event.preventDefault()
    if (!ready || busy) return
    setBusy(true)
    setError(null)
    const input = { code, name, color, kcal }
    try {
      await (account ? createProfile(account, input) : signUp(email, password, input))
    } catch (err) {
      setError(errorMessage(err))
      setBusy(false)
    }
  }

  return (
    <main className="safe-screen flex h-full flex-col px-6">
      <button type="button" onClick={onBack} className="-ml-2 flex h-12 items-center gap-1 self-start text-[17px] text-accent">
        <ChevronIcon size={22} direction="left" />
        {account ? 'Se déconnecter' : 'Connexion'}
      </button>
      <div className="-mx-6 min-h-0 flex-1 overflow-y-auto px-6 pb-6">
        <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.02em]">
          {account ? 'Termine ton inscription' : 'Créer un compte'}
        </h1>
        {step === 'code' ? (
          <form onSubmit={checkCode} className="mt-6 flex flex-col gap-4">
            <p className="text-[15px] text-text-2">Entre le code d’invitation qu’on t’a donné.</p>
            <input
              aria-label="Code d’invitation"
              value={code}
              onChange={(e) => {
                setCode(normalizeCode(e.target.value))
                setError(null)
              }}
              placeholder="XXXX-XXXX"
              autoCapitalize="characters"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="next"
              maxLength={24}
              className={`${FIELD_INPUT} h-14 text-center font-mono text-[22px] tracking-[0.18em]`}
            />
            {error && (
              <p role="alert" className="px-1 text-sm text-accent">
                {error}
              </p>
            )}
            <button type="submit" disabled={code.length < 4 || busy} className={BUTTON}>
              {busy ? 'Vérification…' : 'Continuer'}
            </button>
          </form>
        ) : (
          <form onSubmit={create} noValidate className="mt-6 flex flex-col gap-5">
            <div className="flex items-center gap-4 rounded-card border border-line bg-surface-2 p-4">
              <ProfileOrb profile={colorById(color)} size={48} />
              <span className="min-w-0">
                <span className="block truncate text-[19px] font-semibold">{name.trim() || 'Ton pseudo'}</span>
                <span className="text-[13px] text-text-2">Code {code} accepté</span>
              </span>
            </div>
            <Field label="Pseudo">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={24}
                autoCapitalize="words"
                autoComplete="nickname"
                enterKeyHint="next"
                placeholder="ex. Maman, Julie…"
                className={FIELD_INPUT}
              />
            </Field>
            <div>
              <span className="label px-1">Couleur</span>
              <div className="mt-2">
                <ColorPicker value={color} onChange={setColor} />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-card border border-line bg-surface-2 py-3 pr-4 pl-4">
              <span className="text-[15px] text-text-2">Objectif par jour</span>
              <NumberField label="Objectif calorique par jour" value={kcal} min={800} max={6000} suffix="kcal" onCommit={setKcal} />
            </div>
            {!account && (
              <>
                <Field label="E-mail">
                  <input
                    type="email"
                    name="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="username"
                    inputMode="email"
                    autoCapitalize="none"
                    enterKeyHint="next"
                    placeholder="pour te connecter"
                    className={FIELD_INPUT}
                  />
                </Field>
                <Field label="Mot de passe">
                  <input
                    type="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    enterKeyHint="go"
                    placeholder="6 caractères minimum"
                    className={FIELD_INPUT}
                  />
                </Field>
              </>
            )}
            {error && (
              <p role="alert" className="px-1 text-sm text-accent">
                {error}
              </p>
            )}
            <button type="submit" disabled={!ready || busy} className={BUTTON}>
              {busy ? 'Création…' : 'Créer mon compte'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
