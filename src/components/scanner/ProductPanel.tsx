import { useState } from 'react'
import { formatInt } from '../../lib/format'
import { itemTotals, type MealItem } from '../../lib/nutrition'
import { productItem, type Product } from '../../lib/openFoodFacts'
import { qualityScore } from '../../lib/productScore'
import { AnimatedNumber } from '../AnimatedNumber'
import { Stepper } from '../Stepper'
import { ProductExtras } from './ProductExtras'
import { ProductFacts } from './ProductFacts'
import { QualityScoreCard } from './QualityScoreCard'

interface Props {
  product: Product
  onAdd: (item: MealItem) => void
  onRescan: () => void
}

interface Portion {
  label: string
  grams: number
}

function portions(product: Product): Portion[] {
  const list: Portion[] = []
  if (product.packageGrams) {
    list.push({ label: 'Le paquet', grams: product.packageGrams })
    list.push({ label: 'La moitié', grams: product.packageGrams / 2 })
  }
  if (product.servingGrams) list.push({ label: 'Une portion', grams: product.servingGrams })
  return list.map((portion) => ({ ...portion, grams: Math.round(portion.grams) }))
}

export function ProductPanel({ product, onAdd, onRescan }: Props) {
  const options = portions(product)
  const [grams, setGrams] = useState(options[0]?.grams ?? 100)
  const item = productItem(product, grams)
  const kcal = item ? itemTotals(item).kcal : 0

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="-mx-5 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pb-4">
        <div className="flex items-center gap-4 rounded-card border border-line bg-surface-2 p-3">
          {product.image ? (
            <img src={product.image} alt="" className="size-16 shrink-0 rounded-xl bg-white object-contain" />
          ) : (
            <span className="size-16 shrink-0 rounded-xl bg-white/8" />
          )}
          <div className="min-w-0">
            <p className="line-clamp-2 text-[17px] leading-snug font-semibold">{product.name}</p>
            {product.brand && <p className="truncate text-[15px] text-text-2">{product.brand}</p>}
            <p className="mt-1 text-[13px] text-text-2 tabular-nums">
              Pour 100 g : {formatInt(product.kcal100)} kcal · G {formatInt(product.carbs100)} · L{' '}
              {formatInt(product.fat100)} · P {formatInt(product.protein100)}
            </p>
          </div>
        </div>
        <QualityScoreCard score={qualityScore(product)} />
        <section className="rounded-card border border-line bg-surface-2 p-3">
          <p className="label px-1">Quantité mangée</p>
          {options.length > 0 && (
            <div className="mt-2.5 grid grid-cols-3 gap-2">
              {options.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  aria-pressed={grams === option.grams}
                  onClick={() => setGrams(option.grams)}
                  className={`press flex h-14 flex-col items-center justify-center rounded-card border text-[14px] ${
                    grams === option.grams ? 'border-accent bg-accent/12 text-text' : 'border-line bg-black/20 text-text-2'
                  }`}
                >
                  <span className="font-semibold">{option.label}</span>
                  <span className="text-[12px] tabular-nums">{formatInt(option.grams)} g</span>
                </button>
              ))}
            </div>
          )}
          <div className="mt-2.5 flex items-center justify-between pl-1">
            <span className="text-[15px] text-text-2">
              <span className="text-[22px] font-semibold text-text tabular-nums">
                <AnimatedNumber value={kcal} />
              </span>{' '}
              kcal
            </span>
            <Stepper label="Poids mangé en grammes" value={grams} onChange={setGrams} step={5} min={1} max={5000} />
          </div>
        </section>
        <ProductFacts product={product} />
        <ProductExtras product={product} />
      </div>
      <div className="grid shrink-0 grid-cols-2 gap-2.5 pt-3">
        <button
          type="button"
          onClick={onRescan}
          className="press h-14 rounded-full bg-white/8 text-[15px] font-medium text-accent max-[359px]:text-[14px]"
        >
          Scanner un autre
        </button>
        <button
          type="button"
          disabled={!item}
          onClick={() => item && onAdd(item)}
          className="press h-14 rounded-full bg-accent text-[16px] font-semibold text-black shadow-accent disabled:opacity-35 max-[359px]:text-[15px]"
        >
          Ajouter au repas
        </button>
      </div>
    </div>
  )
}
