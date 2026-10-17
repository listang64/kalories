import { GRADES, type Grade } from '../../lib/openFoodFacts'

const COLORS: Record<Grade, string> = {
  a: '#038141',
  b: '#85bb2f',
  c: '#fecb02',
  d: '#ee8100',
  e: '#e63e11',
}

export function NutriScore({ grade }: { grade: Grade | null }) {
  if (!grade) {
    return (
      <p className="flex h-[86px] shrink-0 items-center justify-center rounded-card border border-dashed border-white/15 text-[14px] text-text-2">
        Nutri-Score non disponible pour ce produit
      </p>
    )
  }

  return (
    <div role="img" aria-label={`Nutri-Score ${grade.toUpperCase()}`} className="shrink-0 rounded-card bg-white px-3 pt-2 pb-3">
      <p className="text-center text-[11px] font-bold tracking-[0.16em] text-[#5a5a5a]">NUTRI-SCORE</p>
      <div className="mt-1.5 flex h-[58px] items-center">
        {GRADES.map((letter, i) => {
          const selected = letter === grade
          const edge = i === 0 ? 'rounded-l-[10px]' : i === GRADES.length - 1 ? 'rounded-r-[10px]' : ''
          return (
            <span
              key={letter}
              aria-hidden="true"
              style={{ backgroundColor: COLORS[letter] }}
              className={
                selected
                  ? 'relative z-10 -mx-1 grid h-[58px] flex-[1.35] place-items-center rounded-[12px] text-[34px] font-black text-white uppercase ring-4 ring-white'
                  : `grid h-11 flex-1 place-items-center text-[22px] font-bold text-white/75 uppercase ${edge}`
              }
            >
              {letter}
            </span>
          )
        })}
      </div>
    </div>
  )
}
