import { useRef, useState, type FormEvent } from 'react'
import { motion } from 'motion/react'
import { Logo } from '../components/Logo'
import { ProfileCard } from '../components/ProfileCard'
import { PROFILE_LIST, type Profile } from '../config/users'
import { authErrorMessage, signIn } from '../hooks/useAuth'

export function LoginScreen() {
  const [selected, setSelected] = useState<Profile | null>(null)
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const select = (profile: Profile) => {
    setSelected(profile)
    setPassword('')
    setError(null)
    inputRef.current?.focus()
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!selected || !password || busy) return
    setBusy(true)
    setError(null)
    try {
      await signIn(selected, password)
    } catch (err) {
      setError(authErrorMessage(err))
      setBusy(false)
    }
  }

  return (
    <main className="safe-screen flex h-full flex-col px-6">
      <div className="pt-12">
        <Logo size={56} />
      </div>
      <p className="label mt-10 text-center">Qui es-tu ?</p>
      <div className="mt-4 flex gap-3">
        {PROFILE_LIST.map((profile) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            selected={selected?.id === profile.id}
            dimmed={selected !== null && selected.id !== profile.id}
            onSelect={() => select(profile)}
          />
        ))}
      </div>
      <motion.form
        onSubmit={submit}
        aria-hidden={!selected}
        initial={false}
        animate={{ opacity: selected ? 1 : 0, y: selected ? 0 : 12 }}
        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        className={`mt-5 flex flex-col gap-3 ${selected ? '' : 'pointer-events-none'}`}
      >
        <input
          type="email"
          name="username"
          autoComplete="username"
          value={selected?.email ?? ''}
          readOnly
          tabIndex={-1}
          className="sr-only"
        />
        <input
          ref={inputRef}
          type="password"
          name="password"
          autoComplete="current-password"
          enterKeyHint="go"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          tabIndex={selected ? 0 : -1}
          className="h-13 w-full rounded-card border border-line bg-surface-2 px-4 text-text outline-none placeholder:text-text-2 focus:border-white/25"
        />
        {error && (
          <p role="alert" className="px-1 text-sm text-accent">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={!password || busy}
          tabIndex={selected ? 0 : -1}
          className="press h-13 w-full rounded-full bg-accent font-semibold text-black shadow-accent disabled:opacity-40"
        >
          {busy ? 'Connexion…' : 'Entrer'}
        </button>
      </motion.form>
    </main>
  )
}
