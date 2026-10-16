import { useState } from 'react'
import { GeminiError, geminiErrorMessage, testGeminiKey } from '../../lib/gemini'
import { DEFAULT_MODEL, maskKey, useLocalSettings } from '../../lib/localSettings'
import { SettingsGroup, SettingsRow } from './SettingsGroup'

type TestState =
  | { status: 'idle' | 'running' | 'ok' }
  | { status: 'error'; message: string; detail: string }

const INPUT = 'min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-text-2'

export function GeminiSettings() {
  const { geminiKey, geminiModel, setGeminiKey, setGeminiModel } = useLocalSettings()
  const [test, setTest] = useState<TestState>({ status: 'idle' })

  const run = async () => {
    setTest({ status: 'running' })
    try {
      await testGeminiKey(geminiKey, geminiModel)
      setTest({ status: 'ok' })
    } catch (error) {
      const detail = error instanceof GeminiError ? error.detail : ''
      setTest({ status: 'error', message: geminiErrorMessage(error), detail })
    }
  }

  return (
    <SettingsGroup
      title="Gemini"
      footer="La clé reste uniquement sur ce téléphone : elle n’est jamais envoyée dans la base ni sur GitHub."
    >
      <KeyRow
        geminiKey={geminiKey}
        onSave={(key) => {
          setGeminiKey(key)
          setTest({ status: 'idle' })
        }}
      />
      <ModelRow model={geminiModel} onSave={setGeminiModel} />
      <div className="px-4 py-3.5">
        <button
          type="button"
          onClick={() => void run()}
          disabled={!geminiKey || test.status === 'running'}
          className="w-full text-left text-[17px] text-accent disabled:text-text-2"
        >
          {test.status === 'running' ? 'Test en cours…' : 'Tester la clé'}
        </button>
        {test.status === 'ok' && <p className="mt-1 text-[15px]">✓ Clé valide, Gemini répond</p>}
        {test.status === 'error' && <p className="mt-1 text-[15px] text-accent">{test.message}</p>}
        {test.status === 'error' && test.detail && (
          <p className="mt-1 line-clamp-3 text-[13px] text-text-2">{test.detail}</p>
        )}
      </div>
    </SettingsGroup>
  )
}

function KeyRow({ geminiKey, onSave }: { geminiKey: string; onSave: (key: string) => void }) {
  const [editing, setEditing] = useState(!geminiKey)
  const [draft, setDraft] = useState('')

  const save = () => {
    if (!draft.trim()) return
    onSave(draft)
    setDraft('')
    setEditing(false)
  }

  if (!editing) {
    return (
      <SettingsRow>
        <span className="flex-1 text-[17px]">Clé API</span>
        <span className="font-mono text-[15px] text-text-2">{maskKey(geminiKey)}</span>
        <button type="button" onClick={() => setEditing(true)} className="text-[15px] text-accent">
          Modifier
        </button>
      </SettingsRow>
    )
  }

  return (
    <SettingsRow>
      <input
        aria-label="Clé API Gemini"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && save()}
        placeholder="Colle ta clé Gemini"
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="done"
        className={`${INPUT} [-webkit-text-security:disc]`}
      />
      {geminiKey && (
        <button type="button" onClick={() => setEditing(false)} className="text-[15px] text-text-2">
          Annuler
        </button>
      )}
      <button
        type="button"
        onClick={save}
        disabled={!draft.trim()}
        className="text-[15px] font-semibold text-accent disabled:opacity-40"
      >
        Enregistrer
      </button>
    </SettingsRow>
  )
}

function ModelRow({ model, onSave }: { model: string; onSave: (model: string) => void }) {
  const [draft, setDraft] = useState<string | null>(null)

  const commit = () => {
    if (draft !== null) onSave(draft)
    setDraft(null)
  }

  return (
    <SettingsRow>
      <span className="text-[17px]">Modèle</span>
      <input
        aria-label="Modèle Gemini"
        value={draft ?? model}
        onFocus={() => setDraft(model)}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        placeholder={DEFAULT_MODEL}
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="done"
        className={`${INPUT} text-right font-mono text-text-2 focus:text-text`}
      />
      {model !== DEFAULT_MODEL && draft === null && (
        <button type="button" onClick={() => onSave(DEFAULT_MODEL)} className="text-[15px] text-accent">
          Défaut
        </button>
      )}
    </SettingsRow>
  )
}
