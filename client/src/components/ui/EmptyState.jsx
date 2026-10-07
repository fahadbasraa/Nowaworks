export function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-field bg-surface-2 border border-border">
        {Icon && <Icon size={18} className="text-text-3" />}
      </div>
      <div className="text-sm font-medium text-text">{title}</div>
      {description && <div className="text-xs text-text-3 max-w-xs">{description}</div>}
    </div>
  );
}
