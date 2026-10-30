import { powerSlots } from '../../lib/game/roles'
import { POWERS } from '../../lib/game/powers'
import { useGameStore } from '../../lib/game/store'
import { Label, Panel } from './ui'

export function PowerPicker() {
  const settings = useGameStore((s) => s.settings)
  const setSettings = useGameStore((s) => s.setSettings)
  const toggle = (id: (typeof POWERS)[number]['id']) =>
    setSettings({ powers: settings.powers.includes(id) ? settings.powers.filter((p) => p !== id) : [...settings.powers, id] })

  return (
    <Panel>
      <Label>
        Rôles spéciaux · {powerSlots(settings)} / {settings.players}
      </Label>
      <ul className="flex flex-col gap-2">
        {POWERS.map((power) => {
          const on = settings.powers.includes(power.id)
          return (
            <li key={power.id}>
              <button
                type="button"
                role="switch"
                aria-checked={on}
                onClick={() => toggle(power.id)}
                className={`press flex w-full items-start gap-3 rounded-xl border p-3 text-left ${on ? 'border-accent bg-accent/10' : 'border-line'}`}
              >
                <span className="text-[24px] leading-none">{power.emoji}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[16px] font-semibold">{power.name}</span>
                  <span className="mt-0.5 block text-[13px] leading-snug text-text-2">{power.rule}</span>
                </span>
                <span className={`mt-0.5 h-6 w-10 shrink-0 rounded-full p-0.5 transition-colors ${on ? 'bg-accent' : 'bg-white/15'}`}>
                  <span className={`block size-5 rounded-full bg-white transition-transform ${on ? 'translate-x-4' : ''}`} />
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </Panel>
  )
}
