import { useWordLibrary } from '../../hooks/useWordLibrary'
import { useGameStore } from '../../lib/game/store'
import type { Rewards } from '../../lib/game/types'
import { categoriesOf } from '../../lib/game/words'
import { LoadingDots } from '../LoadingDots'
import { Chip, Counter, Label, Panel, Stage } from './ui'

const TIMERS = [0, 60, 120, 180, 300]
const REWARDS: { key: keyof Rewards; label: string }[] = [
  { key: 'civil', label: 'Civil gagnant' },
  { key: 'imposteur', label: 'Imposteur gagnant' },
  { key: 'touriste', label: 'Touriste gagnant' },
  { key: 'duel', label: 'Ennemis jurés' },
  { key: 'bouffon', label: 'Bouffon' },
]

export function LibraryScreen({ played }: { played: string[] }) {
  const settings = useGameStore((s) => s.settings)
  const setSettings = useGameStore((s) => s.setSettings)
  const { pairs } = useWordLibrary()

  return (
    <Stage>
      <Panel className="flex flex-col gap-3">
        <Label>Chrono du débat</Label>
        <div className="flex flex-wrap gap-2">
          {TIMERS.map((seconds) => (
            <Chip key={seconds} active={settings.timer === seconds} onClick={() => setSettings({ timer: seconds })}>
              {seconds ? `${seconds / 60} min` : 'Sans chrono'}
            </Chip>
          ))}
        </div>
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
          <>
            <p className="mb-3 text-[14px] leading-snug text-text-2">
              Paires déjà jouées par votre foyer : {pairs.filter((pair) => played.includes(pair.id)).length} sur {pairs.length}. Chaque paire
              ne sort qu’une fois ; quand tout a été joué, la liste repart de zéro.
            </p>
            <ul className="divide-y divide-white/6">
              {categoriesOf(pairs).map((category) => (
                <li key={category.name} className="flex items-center justify-between py-3 text-[16px]">
                  {category.name}
                  <span className="text-[14px] text-text-2">{category.count}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </Panel>
    </Stage>
  )
}
