import { ratingOf, type QualityScore } from '../../lib/productScore'

const RADIUS = 34
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function QualityScoreCard({ score }: { score: QualityScore }) {
  if (score.total === null) {
    return (
      <section className="rounded-card border border-dashed border-white/15 p-4 text-center">
        <p className="text-[16px] font-semibold">Note qualité indisponible</p>
        <p className="mt-1 text-[14px] text-text-2">
          Open Food Facts n’a pas assez de données nutritionnelles pour noter ce produit.
        </p>
      </section>
    )
  }
  const rating = ratingOf(score.total)

  return (
    <section className="flex items-center gap-4 rounded-card border border-line bg-surface-2 p-4">
      <div role="img" aria-label={`Note qualité ${score.total} sur 100, ${rating.label}`} className="relative size-[84px] shrink-0">
        <svg viewBox="0 0 84 84" className="size-full -rotate-90" aria-hidden="true">
          <circle cx="42" cy="42" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
          <circle
            cx="42"
            cy="42"
            r={RADIUS}
            fill="none"
            stroke={rating.color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(CIRCUMFERENCE * score.total) / 100} ${CIRCUMFERENCE}`}
          />
        </svg>
        <span className="absolute inset-0 flex flex-col items-center justify-center leading-none">
          <span className="text-[26px] font-semibold tabular-nums">{score.total}</span>
          <span className="mt-0.5 text-[11px] text-text-2">/100</span>
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="label">Note qualité</p>
        <p className="text-[24px] leading-tight font-semibold" style={{ color: rating.color }}>
          {rating.label}
        </p>
        <p className="mt-1 flex flex-wrap gap-x-2 text-[12px] leading-snug text-text-2 tabular-nums">
          <span className="whitespace-nowrap">Nutrition {score.nutrition}/60</span>
          <span className="whitespace-nowrap">Additifs {score.additives}/30</span>
          <span className="whitespace-nowrap">Bio {score.organic}/10</span>
        </p>
        {score.capped && <p className="mt-1 text-[12px] text-accent">Plafonnée à 49 : additif à risque élevé</p>}
      </div>
    </section>
  )
}
