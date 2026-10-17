import { parseItem, type MealItem } from './nutrition'

export interface Product {
  barcode: string
  name: string
  brand: string
  image: string
  packageGrams: number | null
  servingGrams: number | null
  kcal100: number
  carbs100: number
  fat100: number
  protein100: number
}

export type Lookup = { status: 'found'; product: Product } | { status: 'not-found' | 'no-nutrition' | 'offline' | 'unavailable' }

interface RawProduct {
  product_name?: string
  product_name_fr?: string
  brands?: string
  product_quantity?: number | string
  serving_quantity?: number | string
  image_front_small_url?: string
  nutriments?: Record<string, number | string | undefined>
}

const ENDPOINT = 'https://world.openfoodfacts.org/api/v2/product'
const FIELDS =
  'product_name,product_name_fr,brands,product_quantity,serving_quantity,image_front_small_url,nutriments'
const KJ_PER_KCAL = 4.184

function amount(value: unknown): number | null {
  const n = typeof value === 'string' ? Number(value) : value
  return typeof n === 'number' && Number.isFinite(n) && n >= 0 ? n : null
}

function positive(value: unknown): number | null {
  const n = amount(value)
  return n !== null && n > 0 ? n : null
}

function toProduct(barcode: string, raw: RawProduct): Product | null {
  const n = raw.nutriments ?? {}
  const kj = positive(n.energy_100g)
  const kcal100 = positive(n['energy-kcal_100g']) ?? (kj === null ? null : kj / KJ_PER_KCAL)
  if (kcal100 === null) return null
  return {
    barcode,
    name: (raw.product_name_fr || raw.product_name || '').trim() || 'Produit scanné',
    brand: (raw.brands ?? '').split(',')[0]?.trim() ?? '',
    image: raw.image_front_small_url ?? '',
    packageGrams: positive(raw.product_quantity),
    servingGrams: positive(raw.serving_quantity),
    kcal100,
    carbs100: amount(n.carbohydrates_100g) ?? 0,
    fat100: amount(n.fat_100g) ?? 0,
    protein100: amount(n.proteins_100g) ?? 0,
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
