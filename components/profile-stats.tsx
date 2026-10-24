// Shared statistic tiles keep personal and public profiles visually consistent.
export function ProfileStats({ items }: { items: { label: string; value: number }[] }) {
  return <div className="flex flex-wrap gap-3" aria-label="Travel statistics">
    {items.map(({ label,value }) => <div key={label} className="flex w-36 max-w-full flex-none flex-col gap-1 rounded-2xl border border-brand-yellow/60 bg-brand-yellow-soft px-4 py-3">
      <span className="text-xl font-semibold">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>)}
  </div>;
}
