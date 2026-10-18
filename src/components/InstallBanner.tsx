import { dismissInstall, install, useInstallBanner } from '../lib/install'
import { CloseIcon } from './icons/CloseIcon'

export function InstallBanner() {
  const mode = useInstallBanner()
  if (!mode) return null

  return (
    <div className="mt-3 flex items-center gap-2 rounded-card border border-accent/30 bg-accent/10 py-1.5 pr-1.5 pl-4 text-accent">
      {mode === 'prompt' ? (
        <button type="button" onClick={() => void install()} className="flex h-9 flex-1 items-center gap-2.5 text-left text-[15px]">
          <span className="size-1.5 rounded-full bg-accent" />
          Installer Kalories en plein écran
        </button>
      ) : (
        <p className="flex-1 py-1 text-[13px] leading-snug">
          Pour l’ouvrir en plein écran : menu ⋮ du navigateur, puis « Installer l’application » (pas « Créer un
          raccourci »).
        </p>
      )}
      <button
        type="button"
        aria-label="Masquer"
        onClick={dismissInstall}
        className="grid size-9 shrink-0 place-items-center rounded-full text-accent/70"
      >
        <CloseIcon size={16} />
      </button>
    </div>
  )
}
