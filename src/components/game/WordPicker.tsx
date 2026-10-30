import { useGameStore } from '../../lib/game/store'
import type { WordPair } from '../../lib/game/types'
import { categoriesOf, DIFFICULTIES, eligiblePairs } from '../../lib/game/words'
import { Segmented } from '../Segmented'
import { Chip, Label, Panel } from './ui'

const INPUT = 'w-full rounded-xl border border-line bg-black/30 px-3.5 py-3 text-[16px] outline-none focus:border-white/25'

export function WordPicker({ pairs }: { pairs: WordPair[] }) {
  const settings = useGameStore((s) => s.settings)
  const setSettings = useGameStore((s) => s.setSettings)
  const manual = settings.manual
  const categories = categoriesOf(pairs)
  const pick = (list: string[], value: string) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value])
  const available = eligiblePairs(pairs, settings).length

  return (
    <Panel className="flex flex-col gap-3">
      <Label>Mots secrets</Label>
      <Segmented
        label="Choix des mots"
        value={manual ? 'manual' : 'random'}
        options={[
          { value: 'random', label: 'Au hasard' },
          { value: 'manual', label: 'Je choisis' },
        ]}
        onChange={(mode) => setSettings({ manual: mode === 'manual' ? { civil: '', imposteur: '' } : null })}
      />
      {manual ? (
        <div className="flex flex-col gap-2">
          <input
            aria-label="Mot des civils"
            placeholder="Mot des civils"
            value={manual.civil}
            onChange={(e) => setSettings({ manual: { ...manual, civil: e.target.value.slice(0, 40) } })}
            className={INPUT}
          />
          <input
            aria-label="Mot des imposteurs"
            placeholder="Mot des imposteurs"
            value={manual.imposteur}
            onChange={(e) => setSettings({ manual: { ...manual, imposteur: e.target.value.slice(0, 40) } })}
            className={INPUT}
          />
          <p className="text-[13px] text-text-2">Celui qui écrit les mots ne joue pas, ou connaîtra tous les rôles.</p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {DIFFICULTIES.map((difficulty) => (
              <Chip
                key={difficulty.value}
                active={settings.difficulties.includes(difficulty.value)}
                onClick={() => {
                  const next = pick(settings.difficulties, difficulty.value) as typeof settings.difficulties
                  if (next.length) setSettings({ difficulties: next })
                }}
              >
                {difficulty.label}
              </Chip>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Chip active={settings.categories.length === 0} onClick={() => setSettings({ categories: [] })}>
              Toutes les catégories
            </Chip>
            {categories.map((category) => (
              <Chip
                key={category.name}
                active={settings.categories.includes(category.name)}
                onClick={() => setSettings({ categories: pick(settings.categories, category.name) })}
              >
                {category.name}
              </Chip>
            ))}
          </div>
          <p className={`text-[13px] ${available ? 'text-text-2' : 'text-accent'}`}>
            {available ? `${available} paires possibles` : 'Aucune paire avec ces choix.'}
          </p>
        </>
      )}
    </Panel>
  )
}
