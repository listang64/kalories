import { motion } from 'motion/react'
import { formatInt } from '../../lib/format'
import type { Energy } from '../../lib/needs'
import { AnimatedNumber } from '../AnimatedNumber'
import { NeedsSection } from './NeedsSection'

export function EnergyCard({ energy }: { energy: Energy }) {
  const rows = [
    { label: 'Métabolisme de base', hint: 'au repos complet', value: energy.bmr },
    { label: 'Vie quotidienne', hint: 'travail, tâches, posture', value: energy.daily },
    { label: 'Marche', hint: 'tes pas', value: energy.walking },
    { label: 'Sport', hint: 'moyenne sur la semaine', value: energy.sport },
    { label: 'Digestion', hint: 'environ 10 %', value: energy.digestion },
  ]

  return (
    <NeedsSection
      title="Ta dépense par jour"
      footer={`Formule ${energy.formula}, marge d’environ 10 %. Pèse-toi chaque semaine au réveil : si ton poids n’évolue pas comme prévu après 3 semaines, ajuste de 100 à 200 kcal.`}
    >
      <div className="rounded-card border border-line bg-surface-2 p-4">
        <p className="flex items-baseline gap-2">
          <span className="text-[40px] leading-none font-semibold tracking-[-0.02em] text-accent">
            <AnimatedNumber value={Math.round(energy.total / 10) * 10} />
          </span>
          <span className="text-[15px] text-text-2">kcal par jour</span>
        </p>
        <p className="mt-1 text-[14px] text-text-2">pour garder ton poids actuel</p>
        <ul className="mt-4 flex flex-col gap-3">
          {rows.map((row) => (
            <li key={row.label}>
              <div className="flex items-end gap-2">
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-medium">{row.label}</span>
                  <span className="block text-[12px] text-text-2">{row.hint}</span>
                </span>
                <span className="text-[14px] font-semibold tabular-nums">{formatInt(row.value)} kcal</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/6">
                <motion.div
                  className="h-full rounded-full bg-accent"
                  initial={false}
                  animate={{ width: `${Math.min(100, (row.value / energy.total) * 100)}%` }}
                  transition={{ type: 'spring', stiffness: 220, damping: 30 }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </NeedsSection>
  )
}
