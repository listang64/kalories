import { useState } from 'react'
import type { Product } from '../../lib/openFoodFacts'
import { LEVEL_COLORS } from '../../lib/productScore'
import { NutriScore } from './NutriScore'

const NOVA = ['', 'Brut ou peu transformé', 'Ingrédient culinaire', 'Aliment transformé', 'Ultra-transformé']

const ALLERGENS: Record<string, string> = {
  'en:gluten': 'Gluten',
  'en:milk': 'Lait',
  'en:eggs': 'Œufs',
  'en:nuts': 'Fruits à coque',
  'en:peanuts': 'Arachides',
  'en:soybeans': 'Soja',
  'en:fish': 'Poisson',
  'en:crustaceans': 'Crustacés',
  'en:molluscs': 'Mollusques',
  'en:celery': 'Céleri',
  'en:mustard': 'Moutarde',
  'en:sesame-seeds': 'Sésame',
  'en:sulphur-dioxide-and-sulphites': 'Sulfites',
  'en:lupin': 'Lupin',
}

function allergenName(tag: string): string {
  const name = ALLERGENS[tag] ?? tag.replace(/^[a-z]{2}:/, '').replace(/-/g, ' ')
  return name.charAt(0).toUpperCase() + name.slice(1)
}

const SHORT = 160

export function ProductExtras({ product }: { product: Product }) {
  const [full, setFull] = useState(false)
  const long = product.ingredients.length > SHORT

  return (
    <>
      <NutriScore grade={product.nutriscore} />
      {product.nova && (
        <section className="flex items-center gap-3 rounded-card border border-line bg-surface-2 px-4 py-3">
          <span
            className="grid size-9 shrink-0 place-items-center rounded-lg text-[18px] font-bold text-black"
            style={{ background: LEVEL_COLORS[product.nova - 1] }}
          >
            {product.nova}
          </span>
          <span className="min-w-0">
            <span className="block text-[13px] text-text-2">Transformation (NOVA)</span>
            <span className="block text-[16px] font-medium">{NOVA[product.nova]}</span>
          </span>
        </section>
      )}
      {product.allergens.length > 0 && (
        <section>
          <h4 className="label mb-2 px-1">Allergènes</h4>
          <div className="flex flex-wrap gap-2">
            {product.allergens.map((tag) => (
              <span key={tag} className="rounded-full border border-accent/40 px-3 py-1 text-[14px] text-accent">
                {allergenName(tag)}
              </span>
            ))}
          </div>
        </section>
      )}
      {product.ingredients && (
        <section>
          <h4 className="label mb-2 px-1">Ingrédients</h4>
          <button
            type="button"
            disabled={!long}
            aria-expanded={long ? full : undefined}
            onClick={() => setFull((current) => !current)}
            className="w-full rounded-card border border-line bg-surface-2 p-4 text-left"
          >
            <span className={`block text-[14px] leading-relaxed text-text-2 ${full || !long ? '' : 'line-clamp-3'}`}>
              {product.ingredients}
            </span>
            {long && (
              <span className="mt-1 block text-[13px] font-medium text-accent">{full ? 'Réduire' : 'Tout afficher'}</span>
            )}
          </button>
        </section>
      )}
    </>
  )
}
