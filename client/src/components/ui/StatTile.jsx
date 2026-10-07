export function StatTile({ label, value }) {
  return (
    <div className="rounded-card border border-border bg-surface px-5 py-4 shadow-card">
      <div className="font-mono text-2xl font-medium text-text font-tabular">{value}</div>
      <div className="mt-1 text-xs text-text-2">{label}</div>
    </div>
  );
}
