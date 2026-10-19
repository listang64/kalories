import { useState } from 'react'
import { RISKS, type Additive } from '../../config/additives'
import type { Product } from '../../lib/openFoodFacts'
import { LEVEL_COLORS, productFacts, type Fact } from '../../lib/productScore'
import { ChevronIcon } from '../icons/ChevronIcon'

export function ProductFacts({ product }: { product: Product }) {
  const { flaws, strengths } = productFacts(product)

  return (
    <>
      {flaws.length > 0 && <FactList title="Défauts" facts={flaws} />}
      {strengths.length > 0 && <FactList title="Qualités" facts={strengths} />}
      <p className="px-1 text-[12px] text-text-2">Valeurs pour 100 g, d’après Open Food Facts.</p>
    </>
  )
}

function FactList({ title, facts }: { title: string; facts: Fact[] }) {
  return (
    <section>
      <h4 className="label mb-2 px-1">{title}</h4>
      <ul className="divide-y divide-white/6 overflow-hidden rounded-card border border-line bg-surface-2">
        {facts.map((fact) => (
          <FactRow key={fact.key} fact={fact} />
        ))}
      </ul>
    </section>
  )
}

function FactRow({ fact }: { fact: Fact }) {
  const [open, setOpen] = useState(false)
  const additives = fact.additives ?? []
  const content = (
    <>
      <span className="size-3 shrink-0 rounded-full" style={{ background: LEVEL_COLORS[fact.level] }} />
      <span className="min-w-0 flex-1">
        <span className="block text-[16px] font-medium">{fact.label}</span>
        <span className="block text-[13px] text-text-2">{fact.detail}</span>
      </span>
      {fact.value && <span className="shrink-0 text-[15px] tabular-nums">{fact.value}</span>}
      {additives.length > 0 && (
        <span className={`shrink-0 text-text-2 transition-transform ${open ? 'rotate-90' : ''}`}>
          <ChevronIcon size={18} />
        </span>
      )}
    </>
  )

  return (
    <li>
      {additives.length > 0 ? (
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className="flex w-full items-center gap-3 px-4 py-3 text-left"
        >
          {content}
        </button>
      ) : (
        <div className="flex items-center gap-3 px-4 py-3">{content}</div>
      )}
      {open && <AdditiveList additives={additives} />}
    </li>
  )
}

function AdditiveList({ additives }: { additives: Additive[] }) {
  return (
    <div className="border-t border-white/6 bg-black/20 px-4 py-2">
      <ul className="flex flex-col">
        {additives.map((additive) => {
          const risk = additive.risk === null ? null : RISKS[additive.risk]
          return (
            <li key={additive.code} className="flex items-center gap-3 py-1.5 text-[14px]">
              <span className="size-2 shrink-0 rounded-full" style={{ background: risk?.color ?? 'var(--text-2)' }} />
              <span className="min-w-0 flex-1 leading-snug">
                <span className="block font-semibold">{additive.code}</span>
                {additive.name && <span className="block text-[13px] text-text-2">{additive.name}</span>}
              </span>
              <span className="shrink-0 text-[12px] text-text-2">{risk?.label ?? 'Non évalué'}</span>
            </li>
          )
        })}
      </ul>
      <p className="mt-1 pb-1 text-[11px] leading-snug text-text-2">
        Classement indicatif, d’après les avis publics (EFSA, ANSES, CIRC).
      </p>
    </div>
  )
}
