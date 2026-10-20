import { RECIPE_CATEGORIES } from '../config/recipes'
import { GeminiError, generateWithFallback } from './gemini'
import { base64Of } from './image'
import { parseRecipe, type RecipeInput } from './recipes'

const PROMPT = `Tu es un chef cuisinier. On te donne une recette : texte copié, dictée, photo d'un livre,
d'une fiche ou d'un écran, ou simplement le nom d'un plat.
- Photo ou texte de recette : recopie fidèlement tout ce qui est visible (titre, portions, temps, ingrédients,
  étapes, cuisson), sur toutes les photos (plusieurs pages possibles). Corrige seulement les fautes de lecture
  évidentes. N'invente rien, sauf la préparation : si elle n'est pas écrite, ou seulement en partie (page coupée,
  étapes illisibles), rédige avec tes connaissances les étapes complètes et fiables pour réussir ce plat, avec
  exactement les ingrédients et quantités de la recette ; complète alors la cuisson (cookMinutes, cookTemp,
  cookNote) si elle manque, et mets stepsWritten à true. Sinon, ce qui n'est pas indiqué reste vide ou à 0.
- Juste un nom de plat : propose une recette classique et fiable (stepsWritten à false).
Renvoie la recette structurée, en français :
- name : nom court du plat. category : starter (entrée), main (plat), dessert, ou other.
- ingredients : un par ligne, quantity avec son unité tel qu'écrit (ex. "200 g", "3", "1 c. à soupe"),
  name sans la quantité. group : quand la recette sépare ses ingrédients par préparation (« Pour la pâte »,
  « Crème », « Glaçage »…), le nom court de cette partie avec une majuscule (ex. "Pâte", "Crème") ; sinon
  vide. Garde l'ordre de la recette, les ingrédients d'une même partie à la suite. Pour un simple nom de
  plat à plusieurs préparations (gâteau, tarte, entremets…), groupe aussi les ingrédients par préparation.
- steps : la préparation détaillée, une action par étape, phrases courtes, sans numéro (text). group : comme
  pour les ingrédients, la partie de la recette à laquelle l'étape appartient (mêmes noms, ex. "Pâte",
  "Crème", plus "Montage" ou "Finition" si besoin), les étapes d'une même partie à la suite ; vide si la
  recette n'a pas de parties.
- prepMinutes : temps de préparation, cookMinutes : temps de cuisson, en minutes (0 si aucun).
- cookTemp : température du four en °C (0 si pas de four). cookNote : mode de cuisson court
  (ex. "Four chaleur tournante", "Poêle à feu moyen").
- servings : nombre de personnes.
Si rien ne ressemble à une recette, renvoie name vide.`

const SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    category: { type: 'string', enum: RECIPE_CATEGORIES.map((category) => category.value) },
    servings: { type: 'number' },
    prepMinutes: { type: 'number' },
    cookMinutes: { type: 'number' },
    cookTemp: { type: 'number' },
    cookNote: { type: 'string' },
    ingredients: {
      type: 'array',
      items: {
        type: 'object',
        properties: { name: { type: 'string' }, quantity: { type: 'string' }, group: { type: 'string' } },
        required: ['name', 'quantity'],
      },
    },
    steps: {
      type: 'array',
      items: {
        type: 'object',
        properties: { text: { type: 'string' }, group: { type: 'string' } },
        required: ['text'],
      },
    },
    stepsWritten: { type: 'boolean' },
  },
  required: ['name', 'category', 'ingredients', 'steps', 'stepsWritten'],
}

export interface ReadRecipe {
  recipe: RecipeInput
  wroteSteps: boolean
}

export async function readRecipe(text: string, photos: string[], key: string, model: string): Promise<ReadRecipe | null> {
  const body = {
    systemInstruction: { parts: [{ text: PROMPT }] },
    contents: [
      {
        role: 'user',
        parts: [
          { text: text.trim() || 'Recette en photo.' },
          ...photos.map((src) => ({ inlineData: { mimeType: 'image/jpeg', data: base64Of(src) } })),
        ],
      },
    ],
    generationConfig: { temperature: 0.3, responseMimeType: 'application/json', responseJsonSchema: SCHEMA },
  }
  const { text: answer } = await generateWithFallback(body, key, model, 60_000)
  let data: Record<string, unknown>
  try {
    data = JSON.parse(answer.replace(/^```(?:json)?\s*|\s*```$/g, '')) as Record<string, unknown>
  } catch {
    throw new GeminiError('unreadable')
  }
  const recipe = parseRecipe(data)
  return recipe && { recipe, wroteSteps: data.stepsWritten === true && recipe.steps.length > 0 }
}
