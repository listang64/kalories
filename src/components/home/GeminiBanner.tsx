import { ChevronIcon } from '../icons/ChevronIcon'

export function GeminiBanner({ onPress }: { onPress: () => void }) {
  return (
    <button
      type="button"
      onClick={onPress}
      className="mt-3 flex h-10 w-full items-center gap-2.5 rounded-full border border-accent/30 bg-accent/10 pr-3 pl-4 text-[15px] text-accent"
    >
      <span className="size-1.5 rounded-full bg-accent" />
      <span className="flex-1 text-left">Ajouter ta clé Gemini</span>
      <ChevronIcon size={18} />
    </button>
  )
}
