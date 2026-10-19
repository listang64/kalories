import { parseItem, type MealItem } from './nutrition'

export type Grade = 'a' | 'b' | 'c' | 'd' | 'e'

export const GRADES: Grade[] = ['a', 'b', 'c', 'd', 'e']

export interface Product {
  barcode: string
  nutriscore: Grade | null
  nutriscorePoints: number | null
  nova: 1 | 2 | 3 | 4 | null
  name: string
  brand: string
  image: string
  packageGrams: number | null
  servingGrams: number | null
  kcal100: number
  carbs100: number
  fat100: number
  protein100: number
  sugars100: number | null
  saturated100: number | null
  salt100: number | null
  fiber100: number | null
  fruitVeg100: number | null
  beverage: boolean
  organic: boolean
  additives: string[]
  allergens: string[]
  ingredients: string
}

export type Lookup = { status: 'found'; product: Product } | { status: 'not-found' | 'no-nutrition' | 'offline' | 'unavailable' }

interface RawProduct {
  nutriscore_grade?: string
  nutriscore_score?: number | string
  nutriscore_data?: { is_beverage?: number | boolean }
  nova_group?: number | string
  additives_tags?: string[]
  allergens_tags?: string[]
  labels_tags?: string[]
  categories_tags?: string[]
  ingredients_text_fr?: string
  ingredients_text?: string
  product_name?: string
  product_name_fr?: string
  brands?: string
  product_quantity?: number | string
  serving_quantity?: number | string
  image_front_small_url?: string
  nutriments?: Record<string, number | string | undefined>
}

const ENDPOINT = 'https://world.openfoodfacts.org/api/v2/product'
const FIELDS = [
  'nutriscore_grade',
  'nutriscore_score',
  'nutriscore_data',
  'nova_group',
  'additives_tags',
  'allergens_tags',
  'labels_tags',
  'categories_tags',
  'ingredients_text_fr',
  'ingredients_text',
  'product_name',
  'product_name_fr',
  'brands',
  'product_quantity',
  'serving_quantity',
  'image_front_small_url',
  'nutriments',
].join(',')
const ORGANIC = ['en:organic', 'en:eu-organic', 'fr:ab-agriculture-biologique']
const KJ_PER_KCAL = 4.184

function amount(value: unknown): number | null {
  const n = typeof value === 'string' ? Number(value) : value
  return typeof n === 'number' && Number.isFinite(n) && n >= 0 ? n : null
}

function positive(value: unknown): number | null {
  const n = amount(value)
  return n !== null && n > 0 ? n : null
}

function isGrade(value: unknown): value is Grade {
  return GRADES.some((grade) => grade === value)
}

function nova(value: unknown): Product['nova'] {
  const n = Number(value)
  return n === 1 || n === 2 || n === 3 || n === 4 ? n : null
}

function tags(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((tag): tag is string => typeof tag === 'string') : []
}

function points(value: unknown): number | null {
  const n = typeof value === 'string' ? Number(value) : value
  return typeof n === 'number' && Number.isFinite(n) ? n : null
}

function toProduct(barcode: string, raw: RawProduct): Product | null {
  const n = raw.nutriments ?? {}
  const kj = positive(n.energy_100g)
  const kcal100 = positive(n['energy-kcal_100g']) ?? (kj === null ? null : kj / KJ_PER_KCAL)
  if (kcal100 === null) return null
  const labels = tags(raw.labels_tags)
  const beverage = raw.nutriscore_data?.is_beverage
  return {
    barcode,
    nutriscore: isGrade(raw.nutriscore_grade) ? raw.nutriscore_grade : null,
    nutriscorePoints: points(raw.nutriscore_score),
    nova: nova(raw.nova_group),
    name: (raw.product_name_fr || raw.product_name || '').trim() || 'Produit scanné',
    brand: (raw.brands ?? '').split(',')[0]?.trim() ?? '',
    image: raw.image_front_small_url ?? '',
    packageGrams: positive(raw.product_quantity),
    servingGrams: positive(raw.serving_quantity),
    kcal100,
    carbs100: amount(n.carbohydrates_100g) ?? 0,
    fat100: amount(n.fat_100g) ?? 0,
    protein100: amount(n.proteins_100g) ?? 0,
    sugars100: amount(n.sugars_100g),
    saturated100: amount(n['saturated-fat_100g']),
    salt100: amount(n.salt_100g),
    fiber100: amount(n.fiber_100g),
    fruitVeg100: amount(n['fruits-vegetables-nuts-estimate-from-ingredients_100g']),
    beverage:
      beverage === undefined
        ? tags(raw.categories_tags).includes('en:beverages')
        : beverage === true || beverage === 1,
    organic: labels.some((label) => ORGANIC.includes(label)),
    additives: tags(raw.additives_tags),
    allergens: tags(raw.allergens_tags),
    ingredients: (raw.ingredients_text_fr || raw.ingredients_text || '').trim(),
  }
}

export async function lookupProduct(barcode: string): Promise<Lookup> {
  if (!navigator.onLine) return { status: 'offline' }
  try {
    const response = await fetch(`${ENDPOINT}/${encodeURIComponent(barcode)}.json?fields=${FIELDS}`)
    if (response.status === 404) return { status: 'not-found' }
    if (!response.ok) return { status: 'unavailable' }
    const data = (await response.json()) as { status?: number; product?: RawProduct }
    if (data.status !== 1 || !data.product) return { status: 'not-found' }
    const product = toProduct(barcode, data.product)
    return product ? { status: 'found', product } : { status: 'no-nutrition' }
  } catch {
    return { status: 'unavailable' }
  }
}

export function productItem(product: Product, grams: number): MealItem | null {
  return parseItem({
    name: product.brand ? `${product.name} (${product.brand})` : product.name,
    grams,
    kcal100: product.kcal100,
    carbs100: product.carbs100,
    fat100: product.fat100,
    protein100: product.protein100,
    confidence: 'haute',
  })
}
