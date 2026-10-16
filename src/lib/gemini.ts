import { DEFAULT_MODEL, FALLBACK_MODEL } from './localSettings'

const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models'
const TIMEOUT = 30_000

export type GeminiErrorKind = 'no-key' | 'invalid-key' | 'model' | 'quota' | 'busy' | 'unavailable' | 'unreadable'

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
  'invalid-key': 'Clé Gemini refusée',
  model: 'Modèle Gemini introuvable',
  quota: 'Trop de demandes, réessaie dans une minute',
  busy: 'Gemini est surchargé, réessaie dans un instant',
  unavailable: 'Analyse impossible pour l’instant',
  unreadable: 'Réponse de Gemini illisible',
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

function kindForStatus(status: number): GeminiErrorKind {
  if (status === 400 || status === 401 || status === 403) return 'invalid-key'
  if (status === 404) return 'model'
  if (status === 429) return 'quota'
  if (status === 503) return 'busy'
  return 'unavailable'
}

export async function generateContent(body: object, key: string, model: string): Promise<string> {
  if (!key) throw new GeminiError('no-key')
  const name = model.replace(/^models\//, '').trim() || DEFAULT_MODEL
  let response: Response
  try {
    response = await fetch(`${ENDPOINT}/${encodeURIComponent(name)}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT),
    })
  } catch {
    throw new GeminiError('unavailable')
  }
  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as GeminiErrorBody
    throw new GeminiError(kindForStatus(response.status), data.error?.message ?? '')
  }
  const data = (await response.json().catch(() => null)) as GeminiResponse | null
  return data?.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('') ?? ''
}

export function isTemporary(error: unknown): boolean {
  return error instanceof GeminiError && (error.kind === 'quota' || error.kind === 'busy')
}

export async function generateWithFallback(body: object, key: string, model: string) {
  try {
    return { text: await generateContent(body, key, model), model }
  } catch (error) {
    if (!isTemporary(error) || model === FALLBACK_MODEL) throw error
    try {
      return { text: await generateContent(body, key, FALLBACK_MODEL), model: FALLBACK_MODEL }
    } catch (fallbackError) {
      throw fallbackError instanceof GeminiError && fallbackError.kind === 'model' ? error : fallbackError
    }
  }
}

export async function testGeminiKey(key: string, model: string): Promise<string> {
  const body = { contents: [{ role: 'user', parts: [{ text: 'Réponds simplement : OK' }] }] }
  return (await generateWithFallback(body, key, model)).model
}
