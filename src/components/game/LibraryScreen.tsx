import { useState } from 'react'
import { useWordLibrary } from '../../hooks/useWordLibrary'
import { useGameStore } from '../../lib/game/store'
import type { Rewards, TieRule } from '../../lib/game/types'
import { categoriesOf, RECENT_GAMES } from '../../lib/game/words'
import { LoadingDots } from '../LoadingDots'
import { Chip, Counter, Label, Panel, Stage } from './ui'

const TIMERS = [0, 60, 120, 180, 300]
const TIE_RULES: { value: TieRule; label: string }[] = [
  { value: 'revote', label: 'Vote décisif' },
  { value: 'hasard', label: 'Au hasard' },
  { value: 'aucun', label: 'Personne' },
]
const REWARDS: { key: keyof Rewards; label: string }[] = [
  { key: 'civil', label: 'Civil gagnant' },
  { key: 'imposteur', label: 'Imposteur gagnant' },
  { key: 'touriste', label: 'Touriste gagnant' },
  { key: 'duel', label: 'Ennemis jurés' },
  { key: 'bouffon', label: 'Bouffon' },
]

export function LibraryScreen() {
  const settings = useGameStore((s) => s.settings)
  const setSettings = useGameStore((s) => s.setSettings)
  const { pairs } = useWordLibrary()
  const [open, setOpen] = useState<string | null>(null)

  return (
    <Stage>
      <Panel className="flex flex-col gap-3">
        <Label>Discussion</Label>
        <div className="flex flex-wrap gap-2">
          {TIMERS.map((seconds) => (
            <Chip key={seconds} active={settings.timer === seconds} onClick={() => setSettings({ timer: seconds })}>
              {seconds ? `${seconds / 60} min` : 'Sans chrono'}
            </Chip>
          ))}
        </div>
        <Label>Si l’égalité persiste (sans Juge)</Label>
        <div className="flex flex-wrap gap-2">
          {TIE_RULES.map((rule) => (
            <Chip key={rule.value} active={settings.tieRule === rule.value} onClick={() => setSettings({ tieRule: rule.value })}>
              {rule.label}
            </Chip>
          ))}
        </div>
        <Chip active={settings.avoidRecent} onClick={() => setSettings({ avoidRecent: !settings.avoidRecent })}>
          {settings.avoidRecent ? '✓ ' : ''}Éviter les paires des {RECENT_GAMES} dernières parties
        </Chip>
      </Panel>
      <Panel className="flex flex-col gap-2.5">
        <Label>Points</Label>
        {REWARDS.map((reward) => (
          <Counter
            key={reward.key}
            label={reward.label}
            value={settings.rewards[reward.key]}
            min={0}
            max={20}
            onChange={(value) => setSettings({ rewards: { ...settings.rewards, [reward.key]: value } })}
          />
        ))}
      </Panel>
      <Panel>
        <Label>Bibliothèque · {pairs?.length ?? '…'} paires</Label>
        {!pairs ? (
          <LoadingDots />
        ) : (
          <ul className="divide-y divide-white/6">
            {categoriesOf(pairs).map((category) => (
              <li key={category.name}>
                <button
                  type="button"
                  aria-expanded={open === category.name}
                  onClick={() => setOpen(open === category.name ? null : category.name)}
                  className="flex w-full items-center justify-between py-3 text-left text-[16px]"
                >
                  {category.name}
                  <span className="text-[14px] text-text-2">{category.count}</span>
                </button>
                {open === category.name && (
                  <ul className="pb-3 text-[14px] leading-relaxed text-text-2">
                    {pairs
                      .filter((pair) => pair.category === category.name)
                      .map((pair) => (
                        <li key={pair.id}>
                          {pair.word_civil} / {pair.word_undercover} · <span className="text-[12px]">{pair.difficulty}</span>
                        </li>
                      ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </Stage>
  )
}
