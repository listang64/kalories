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
- Vidéo (lien YouTube ou fichier vidéo) : regarde et écoute toute la vidéo. Relève les ingrédients montrés,
  cités à l'oral, écrits à l'écran ou dans la description, et les étapes dans l'ordre où elles sont faites.
  Si une quantité n'est pas dite, estime-la d'après ce que tu vois. Rédige des étapes complètes et claires
  (stepsWritten à false si la vidéo montre toute la préparation, true si tu as dû la compléter).
- Description d'une page de vidéo (TikTok, Instagram…) : sers-t'en comme du texte de la recette.
- Juste un nom de plat : propose une recette classique et fiable (stepsWritten à false).
Renvoie la recette structurée, en français :
- name : nom court du plat. category : starter (entrée), main (plat), dessert, ou other.
- ingredients : un par ligne. quantity : toujours un poids en grammes (ex. "200 g", "1200 g"), pour tous
  les ingrédients sans exception, y compris liquides, ingrédients à l'unité et cuillères ; convertis les
  autres unités avec un poids moyen réaliste (ex. 1 œuf ≈ 50 g, 10 cl de lait ≈ 100 g, 1 c. à soupe d'huile
  ≈ 10 g, 1 pincée de sel ≈ 1 g). name sans la quantité ; pour un ingrédient compté à l'unité, ajoute le
  nombre entre parenthèses (ex. "Œufs (3)", "Oignons (2)"). group : quand la recette sépare ses ingrédients par préparation (« Pour la pâte »,
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

export interface RecipeVideo {
  name: string
  mimeType: string
  data: string
}

export interface RecipeSources {
  text: string
  photos: string[]
  link: string
  video: RecipeVideo | null
}

const YOUTUBE = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|live\/|embed\/)|youtu\.be\/)([\w-]{11})/i
const LINK_PROMPT = `Ouvre cette page (vidéo TikTok, Instagram ou autre site de cuisine). Recopie fidèlement tout ce
qui concerne la recette : titre, légende ou description de l'auteur, ingrédients et quantités, étapes, temps et
cuisson. N'invente rien. Si la page est inaccessible ou ne contient aucune recette, réponds seulement : INACCESSIBLE`

export function videoLink(input: string): { url: string; youtube: boolean } | null {
  const url = /https?:\/\/\S+/i.exec(input.trim())?.[0]
  if (!url) return null
  const id = YOUTUBE.exec(url)?.[1]
  return id ? { url: `https://www.youtube.com/watch?v=${id}`, youtube: true } : { url, youtube: false }
}

async function pageText(url: string, key: string, model: string): Promise<string> {
  const body = {
    contents: [{ role: 'user', parts: [{ text: `${LINK_PROMPT}\n${url}` }] }],
    tools: [{ url_context: {} }],
    generationConfig: { temperature: 0.2 },
  }
  try {
    const { text } = await generateWithFallback(body, key, model, 60_000)
    return /INACCESSIBLE/.test(text) ? '' : text.trim()
  } catch (error) {
    if (error instanceof GeminiError && ['offline', 'quota', 'no-key'].includes(error.kind)) throw error
    return ''
  }
}

export async function readRecipe(sources: RecipeSources, key: string, model: string): Promise<ReadRecipe | null> {
  const { photos, video } = sources
  const link = videoLink(sources.link)
  const page = link && !link.youtube ? await pageText(link.url, key, model) : ''
  const text = sources.text.trim()
  if (link && !link.youtube && !page && !text && photos.length === 0 && !video) throw new GeminiError('link')
  const intro = [text, page && `Description de la page ${link?.url} :\n${page}`].filter(Boolean).join('\n\n')
  const body = {
    systemInstruction: { parts: [{ text: PROMPT }] },
    contents: [
      {
        role: 'user',
        parts: [
          ...(link?.youtube ? [{ fileData: { fileUri: link.url } }] : []),
          ...(video ? [{ inlineData: { mimeType: video.mimeType, data: video.data } }] : []),
          ...photos.map((src) => ({ inlineData: { mimeType: 'image/jpeg', data: base64Of(src) } })),
          { text: intro || (link?.youtube || video ? 'Recette en vidéo.' : 'Recette en photo.') },
        ],
      },
    ],
    generationConfig: { temperature: 0.3, responseMimeType: 'application/json', responseJsonSchema: SCHEMA },
  }
  const { text: answer } = await generateWithFallback(body, key, model, link?.youtube || video ? 180_000 : 60_000)
  let data: Record<string, unknown>
  try {
    data = JSON.parse(answer.replace(/^```(?:json)?\s*|\s*```$/g, '')) as Record<string, unknown>
  } catch {
    throw new GeminiError('unreadable')
  }
  const recipe = parseRecipe(data)
  return recipe && { recipe, wroteSteps: data.stepsWritten === true && recipe.steps.length > 0 }
}
