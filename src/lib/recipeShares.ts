import { FirebaseError } from 'firebase/app'
import { doc, getDocFromServer, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import type { Profile } from './profiles'
import { parseRecipe, type RecipeInput } from './recipes'
import { shareText, type ShareResult } from './share'
import { normalizeCode, randomCode } from './shared'

export const SHARE_DAYS = 30
const LIFETIME = SHARE_DAYS * 24 * 3600 * 1000
const PARAM = 'recette'

export interface SharedRecipe {
  code: string
  recipe: RecipeInput
  fromName: string
}

export type ShareLookup = { status: 'found'; shared: SharedRecipe } | { status: 'unknown' | 'expired' | 'offline' }

export async function createRecipeShare(recipe: RecipeInput, me: Profile): Promise<string> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const code = randomCode()
    try {
      await setDoc(doc(db, 'recipeShares', code), {
        recipe: parseRecipe(recipe),
        createdBy: me.uid,
        createdByName: me.name,
        createdAt: serverTimestamp(),
      })
      return code
    } catch (error) {
      if (attempt === 2) throw error
    }
  }
  throw new Error('Code indisponible')
}

export async function findRecipeShare(text: string): Promise<ShareLookup> {
  const code = normalizeCode(text)
  if (code.length !== 6) return { status: 'unknown' }
  try {
    const snapshot = await getDocFromServer(doc(db, 'recipeShares', code))
    const data = snapshot.data()
    const recipe = parseRecipe(data?.recipe)
    const created = data?.createdAt as { toMillis?: () => number } | undefined
    if (!recipe) return { status: 'unknown' }
    if ((created?.toMillis?.() ?? 0) + LIFETIME < Date.now()) return { status: 'expired' }
    const fromName = typeof data?.createdByName === 'string' ? data.createdByName : ''
    return { status: 'found', shared: { code, recipe, fromName } }
  } catch (error) {
    return { status: error instanceof FirebaseError && error.code === 'permission-denied' ? 'expired' : 'offline' }
  }
}

export function recipeShareLink(code: string): string {
  return `${window.location.origin}${import.meta.env.BASE_URL}?${PARAM}=${code}`
}

export function shareRecipeCode(name: string, code: string): Promise<ShareResult> {
  return shareText(
    [
      `Je te partage ma recette « ${name} » sur Kalories : ${recipeShareLink(code)}`,
      `Ou dans Kalories → Recettes → Code reçu, entre le code ${code} (valable ${SHARE_DAYS} jours).`,
    ].join('\n'),
  )
}

export function takeRecipeLink(): string | null {
  const url = new URL(window.location.href)
  const code = normalizeCode(url.searchParams.get(PARAM) ?? '')
  if (!url.searchParams.has(PARAM)) return null
  url.searchParams.delete(PARAM)
  window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash)
  return code.length === 6 ? code : null
}
