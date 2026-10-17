import { useState, type FormEvent } from 'react'
import { Logo } from '../components/Logo'
import { authErrorMessage, lastEmail, resetPassword, signIn } from '../lib/auth'

const INPUT =
  'h-13 w-full rounded-card border border-line bg-surface-2 px-4 text-text outline-none placeholder:text-text-2 focus:border-white/25'

export function LoginScreen() {
  const [email, setEmail] = useState(lastEmail)
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!email.trim() || !password || busy) return
    setBusy(true)
    setMessage(null)
    try {
      await signIn(email, password)
    } catch (error) {
      setMessage({ text: authErrorMessage(error), error: true })
      setBusy(false)
    }
  }

  const forgot = async () => {
    if (!email.trim()) return setMessage({ text: 'Écris d’abord ton adresse e-mail', error: true })
    try {
      await resetPassword(email)
      setMessage({ text: 'E-mail envoyé : suis le lien pour choisir un nouveau mot de passe', error: false })
    } catch (error) {
      setMessage({ text: authErrorMessage(error), error: true })
    }
  }

  return (
    <main className="safe-screen flex h-full flex-col px-6">
      <div className="pt-12">
        <Logo size={56} />
      </div>
      <form onSubmit={submit} className="mt-10 flex flex-col gap-3">
        <input
          type="email"
          name="username"
          autoComplete="username"
          inputMode="email"
          autoCapitalize="none"
          placeholder="Adresse e-mail"
          aria-label="Adresse e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={INPUT}
        />
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          enterKeyHint="go"
          placeholder="Mot de passe"
          aria-label="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={INPUT}
        />
        {message && (
          <p role="alert" className={`px-1 text-sm ${message.error ? 'text-accent' : 'text-text-2'}`}>
            {message.text}
          </p>
        )}
        <button
          type="submit"
          disabled={!email.trim() || !password || busy}
          className="press h-13 w-full rounded-full bg-accent font-semibold text-black shadow-accent disabled:opacity-40"
        >
          {busy ? 'Connexion…' : 'Entrer'}
        </button>
      </form>
      <button type="button" onClick={() => void forgot()} className="mt-4 h-10 self-center text-[15px] text-text-2">
        Mot de passe oublié ?
      </button>
    </main>
  )
}
