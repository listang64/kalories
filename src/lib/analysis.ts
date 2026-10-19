import { mealLabel, type MealType } from '../config/meals'
import { GeminiError, generateWithFallback } from './gemini'
import { base64Of } from './image'
import { parseItem, type MealItem } from './nutrition'

const SYSTEM_PROMPT = `Tu es un nutritionniste expert. On te donne une description et/ou des photos d'un repas.
- Identifie chaque aliment séparément (riz, poulet, sauce, pain, boisson…).
- Estime le poids réellement mangé en grammes d'après la taille des portions
  (repères : assiette standard ≈ 26 cm, couverts, main).
- Le texte de l'utilisateur est prioritaire sur la photo : s'il donne une quantité
  ou un aliment, utilise-le tel quel.
- Donne les valeurs pour 100 g de l'aliment tel que consommé (cuit, avec sa matière
  grasse de cuisson), en t'appuyant sur la table française Ciqual quand c'est possible.
- Boissons : 1 ml = 1 g. Ignore ce qui ne se mange pas (os, emballage).
- Noms courts en français. confidence = ta certitude sur le poids.
- Si aucun aliment n'est visible, renvoie items vide et explique pourquoi dans comment.`

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          grams: { type: 'number' },
          kcal100: { type: 'number' },
          carbs100: { type: 'number' },
          fat100: { type: 'number' },
          protein100: { type: 'number' },
          confidence: { type: 'string', enum: ['haute', 'moyenne', 'basse'] },
        },
        required: ['name', 'grams', 'kcal100', 'carbs100', 'fat100', 'protein100', 'confidence'],
      },
    },
    comment: { type: 'string' },
    title: { type: 'string' },
  },
  required: ['items'],
}

type Part = { text: string } | { inlineData: { mimeType: string; data: string } }

export interface Analysis {
  items: MealItem[]
  comment: string
  title: string
}

function parse(text: string): Analysis | null {
  try {
    const data = JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g, '')) as Record<string, unknown>
    if (!Array.isArray(data.items)) return null
    const items = data.items.map(parseItem).filter((item): item is MealItem => item !== null)
    const comment = typeof data.comment === 'string' ? data.comment : ''
    return { items, comment, title: typeof data.title === 'string' ? data.title.trim() : '' }
  } catch {
    return null
  }
}

async function requestItems(parts: Part[], key: string, model: string): Promise<Analysis> {
  const body = {
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [{ role: 'user', parts }],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json',
      responseJsonSchema: RESPONSE_SCHEMA,
    },
  }
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const result = parse((await generateWithFallback(body, key, model)).text)
    if (result) return result
  }
  throw new GeminiError('unavailable', 'Réponse illisible')
}

export interface MealRequest {
  type: MealType
  note: string
  photos: string[]
}

export function analyzeMeal({ type, note, photos }: MealRequest, key: string, model: string) {
  const description = note.trim() || 'aucune, analyse uniquement les photos'
  const several =
    photos.length > 1
      ? ` ${photos.length} photos jointes : elles peuvent montrer le même plat sous plusieurs angles ou des plats différents du même repas, ne compte jamais deux fois le même aliment.`
      : ''
  const parts: Part[] = [
    { text: `Repas : ${mealLabel(type)}. Description : ${description}.${several}` },
    ...photos.map((src) => ({ inlineData: { mimeType: 'image/jpeg', data: base64Of(src) } })),
  ]
  return requestItems(parts, key, model)
}

export function correctMeal(items: MealItem[], instruction: string, key: string, model: string) {
  const text = `Repas actuel (JSON) : ${JSON.stringify({ items })}
Correction de l'utilisateur : ${instruction.trim()}
Applique la correction et renvoie la liste complète mise à jour.`
  return requestItems([{ text }], key, model)
}

export function describeFood(description: string, key: string, model: string) {
  const text = `Aliment ou recette à enregistrer en favori : ${description.trim()}
Liste chaque ingrédient avec le poids indiqué (sinon une portion habituelle).
Dans title, donne un nom court et naturel pour l'ensemble (4 mots maximum).`
  return requestItems([{ text }], key, model)
}
