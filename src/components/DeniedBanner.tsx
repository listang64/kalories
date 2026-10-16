export function DeniedBanner({ what }: { what: string }) {
  return (
    <div role="alert" className="mt-4 shrink-0 rounded-card border border-accent/30 bg-accent/10 px-4 py-3">
      <p className="text-[15px] leading-snug">La base refuse l’accès {what}.</p>
      <p className="mt-1 text-[13px] leading-snug text-text-2">
        Déconnecte-toi puis reconnecte-toi depuis les Paramètres. Tout se reconnecte tout seul ensuite.
      </p>
    </div>
  )
}
