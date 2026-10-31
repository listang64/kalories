import { cleanKey, DEFAULT_MODEL, FALLBACK_MODEL } from './localSettings'

const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models'
const TIMEOUT = 30_000
const TEST_TIMEOUT = 15_000
const FALLBACK_PERIOD = 5 * 60_000

let fallbackUntil = 0

export type GeminiErrorKind =
  | 'no-key'
  | 'offline'
  | 'invalid-key'
  | 'model'
  | 'quota'
  | 'busy'
  | 'unavailable'
  | 'unreadable'
  | 'rejected'
  | 'link'

export class GeminiError extends Error {
  readonly kind: GeminiErrorKind
  readonly detail: string

  constructor(kind: GeminiErrorKind, detail = '') {
    super(kind)
    this.kind = kind
    this.detail = detail
  }
}

const MESSAGES: Record<GeminiErrorKind, string> = {
  'no-key': 'Ajoute ta clé Gemini dans les Paramètres',
  offline: 'Pas de connexion : l’analyse demande du réseau',
  'invalid-key': 'Clé Gemini refusée',
  model: 'Modèle Gemini introuvable',
  quota: 'Trop de demandes, réessaie dans une minute',
  busy: 'Gemini est surchargé, réessaie dans un instant',
  unavailable: 'Analyse impossible pour l’instant',
  unreadable: 'Réponse de Gemini illisible',
  rejected: 'Gemini n’a pas pu lire ce contenu',
  link: 'Ce lien ne se lit pas : enregistre la vidéo sur ton téléphone puis ajoute-la avec le bouton Vidéo',
}

export function geminiErrorMessage(error: unknown): string {
  return MESSAGES[error instanceof GeminiError ? error.kind : 'unavailable']
}

interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: string }[] } }[]
}

interface GeminiErrorBody {
  error?: { message?: string }
}

const RETRY_DELAY = 800

function kindForStatus(status: number, message: string): GeminiErrorKind {
  if (status === 400 && !/api.?key/i.test(message)) return 'rejected'
  if (status === 400 || status === 401 || status === 403) return 'invalid-key'
  if (status === 404) return 'model'
  if (status === 429) return 'quota'
  if (status >= 500) return 'busy'
  return 'unavailable'
}

function describe(error: unknown): string {
  return error instanceof Error ? `${error.name} : ${error.message}` : String(error)
}

function isTimeout(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

async function send(url: string, init: RequestInit, timeout: number): Promise<Response> {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), timeout)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    window.clearTimeout(timer)
  }
}

async function sendWithRetry(url: string, init: RequestInit, timeout: number): Promise<Response> {
  try {
    return await send(url, init, timeout)
  } catch (error) {
    if (isTimeout(error)) throw error
    await new Promise((resolve) => window.setTimeout(resolve, RETRY_DELAY))
    return send(url, init, timeout)
  }
}

export async function generateContent(body: object, key: string, model: string, timeout = TIMEOUT): Promise<string> {
  const apiKey = cleanKey(key)
  if (!apiKey) throw new GeminiError('no-key')
  if (!navigator.onLine) throw new GeminiError('offline')
  const name = model.replace(/^models\//, '').trim() || DEFAULT_MODEL
  let response: Response
  try {
    response = await sendWithRetry(
      `${ENDPOINT}/${encodeURIComponent(name)}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify(body),
      },
      timeout,
    )
  } catch (error) {
    if (isTimeout(error)) throw new GeminiError('busy', `Pas de réponse en ${timeout / 1000} s`)
    throw new GeminiError('unavailable', describe(error))
  }
  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as GeminiErrorBody
    const message = data.error?.message ?? ''
    throw new GeminiError(kindForStatus(response.status, message), `HTTP ${response.status} · ${message}`)
  }
  const data = (await response.json().catch(() => null)) as GeminiResponse | null
  return data?.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('') ?? ''
}

export function isTemporary(error: unknown): boolean {
  return error instanceof GeminiError && (error.kind === 'quota' || error.kind === 'busy')
}

function modelOrder(model: string): string[] {
  if (model === FALLBACK_MODEL) return [model]
  return Date.now() < fallbackUntil ? [FALLBACK_MODEL, model] : [model, FALLBACK_MODEL]
}

export async function generateWithFallback(body: object, key: string, model: string, timeout = TIMEOUT) {
  let lastError: unknown = null
  for (const name of modelOrder(model)) {
    try {
      return { text: await generateContent(body, key, name, timeout), model: name }
    } catch (error) {
      const missingFallback = name !== model && error instanceof GeminiError && error.kind === 'model'
      if (!isTemporary(error) && !missingFallback) throw error
      if (name === model) fallbackUntil = Date.now() + FALLBACK_PERIOD
      if (!missingFallback) lastError = error
    }
  }
  throw lastError
}

export async function testGeminiKey(key: string, model: string): Promise<string> {
  const body = { contents: [{ role: 'user', parts: [{ text: 'Réponds simplement : OK' }] }] }
  return (await generateWithFallback(body, key, model, TEST_TIMEOUT)).model
}
