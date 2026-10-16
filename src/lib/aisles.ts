import { AISLES, isAisle, type Aisle } from '../config/aisles'
import { GeminiError, generateWithFallback } from './gemini'
import type { ShoppingItem } from './shopping'

const PROMPT = `Tu ranges une liste de courses selon les rayons d'un hypermarché français.
Pour chaque article numéroté, renvoie son numéro n et son rayon :
- produce : fruits et légumes frais, herbes aromatiques
- fresh : produits frais et surgelés (crèmerie, beurre, œufs, fromages, yaourts, viandes, poissons, charcuterie, traiteur)
- nonfood : non alimentaire (hygiène, beauté, papier toilette, mouchoirs, pharmacie, bébé, animaux, bazar, piles, vêtements)
- grocery : épicerie (pâtes, riz, conserves, farine, sucre, huile, sauces, épices, céréales, biscuits, café, thé, boissons, pain)
- cleaning : produits d'entretien (lessive, liquide vaisselle, nettoyants, éponges, sacs poubelle, essuie-tout)
- other : uniquement si l'article ne correspond à aucun de ces rayons`

const SCHEMA = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          n: { type: 'integer' },
          aisle: { type: 'string', enum: AISLES.map((aisle) => aisle.id) },
        },
        required: ['n', 'aisle'],
      },
    },
  },
  required: ['items'],
}

function parse(text: string): Map<number, Aisle> | null {
  try {
    const data = JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g, '')) as { items?: unknown }
    if (!Array.isArray(data.items)) return null
    const found = new Map<number, Aisle>()
    for (const entry of data.items as { n?: unknown; aisle?: unknown }[]) {
      if (typeof entry.n === 'number' && isAisle(entry.aisle)) found.set(entry.n, entry.aisle)
    }
    return found
  } catch {
    return null
  }
}

export async function classifyAisles(items: ShoppingItem[], key: string, model: string) {
  const list = items.map((item, i) => `${i + 1}. ${item.name}${item.quantity ? ` (${item.quantity})` : ''}`)
  const body = {
    systemInstruction: { parts: [{ text: PROMPT }] },
    contents: [{ role: 'user', parts: [{ text: list.join('\n') }] }],
    generationConfig: { temperature: 0.1, responseMimeType: 'application/json', responseJsonSchema: SCHEMA },
  }
  const found = parse((await generateWithFallback(body, key, model)).text)
  if (!found) throw new GeminiError('unreadable')
  return Object.fromEntries(items.map((item, i): [string, Aisle] => [item.id, found.get(i + 1) ?? 'other']))
}
