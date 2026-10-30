import { useWordLibrary } from '../../hooks/useWordLibrary'
import { createGame } from '../../lib/game/engine'
import { defaultCounts, MAX_PLAYERS, MIN_PLAYERS, setupError } from '../../lib/game/roles'
import { useGameStore } from '../../lib/game/store'
import { choosePair, eligiblePairs } from '../../lib/game/words'
import { LoadingDots } from '../LoadingDots'
import { PowerPicker } from './PowerPicker'
import { BigButton, Counter, Label, Panel, Stage } from './ui'
import { WordPicker } from './WordPicker'

export function SetupScreen({ onStart }: { onStart: () => void }) {
  const settings = useGameStore((s) => s.settings)
  const setSettings = useGameStore((s) => s.setSettings)
  const { pairs, failed } = useWordLibrary()
  const { counts } = settings
  const empty = !settings.manual && pairs !== null && eligiblePairs(pairs, settings).length === 0
  const error = setupError(settings) ?? (empty ? 'Aucune paire de mots avec ces choix.' : null)

  const setPlayers = (players: number) => setSettings({ players, counts: defaultCounts(players) })
  const setCount = (camp: 'imposteur' | 'touriste', value: number) => {
    const next = { ...counts, [camp]: value }
    setSettings({ counts: { ...next, civil: settings.players - next.imposteur - next.touriste } })
  }

  const start = () => {
    const { recent, names, apply } = useGameStore.getState()
    const pair = choosePair(pairs ?? [], settings, recent)
    if (!pair) return
    apply(createGame(settings, pair, names.slice(0, settings.players)))
    onStart()
  }

  return (
    <Stage>
      <Panel>
        <Label>Joueurs</Label>
        <Counter label="Nombre de joueurs" value={settings.players} min={MIN_PLAYERS} max={MAX_PLAYERS} onChange={setPlayers} />
      </Panel>
      <Panel className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="label text-accent">Répartition</p>
          <button type="button" onClick={() => setPlayers(settings.players)} className="text-[14px] font-medium text-accent">
            Conseillée
          </button>
        </div>
        <Counter nowrap label="🕵️ Imposteurs" value={counts.imposteur} min={0} max={settings.players - 2} onChange={(v) => setCount('imposteur', v)} />
        <Counter nowrap label="🧳 Touristes" value={counts.touriste} min={0} max={settings.players - 2} onChange={(v) => setCount('touriste', v)} />
        <p className="flex justify-between text-[16px]">
          <span>🧑‍🤝‍🧑 Civils</span>
          <span className="w-[112px] text-center text-[20px] font-semibold tabular-nums">{counts.civil}</span>
        </p>
      </Panel>
      <PowerPicker />
      {pairs ? (
        <WordPicker pairs={pairs} />
      ) : (
        <Panel className="text-center text-[15px] text-text-2">
          {failed ? 'Impossible de charger les mots. Rouvre le jeu.' : <LoadingDots />}
        </Panel>
      )}
      {error && <p className="text-center text-[14px] text-accent">{error}</p>}
      <BigButton onClick={start} disabled={error !== null || (!pairs && !settings.manual)}>
        Distribuer les rôles
      </BigButton>
    </Stage>
  )
}
