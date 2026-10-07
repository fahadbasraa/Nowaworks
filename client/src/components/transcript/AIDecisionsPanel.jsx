import { ArrowRightLeft, XCircle, UserX } from "lucide-react";

const GROUPS = [
  { type: "revised", label: "Revised values", icon: ArrowRightLeft },
  { type: "excluded", label: "Excluded features", icon: XCircle },
  { type: "ignored_person", label: "Ignored people", icon: UserX },
];

export function AIDecisionsPanel({ decisions }) {
  if (!decisions || decisions.length === 0) return null;

  return (
    <div className="rounded-card border border-border bg-surface-2 p-4">
      <h3 className="text-sm font-semibold text-text">AI decisions</h3>
      <p className="mt-0.5 text-xs text-text-3">Judgment calls the AI made while reading the transcript.</p>

      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {GROUPS.map(({ type, label, icon: Icon }) => {
          const items = decisions.filter((d) => d.type === type);
          return (
            <div key={type}>
              <div className="flex items-center gap-1.5 text-xs font-medium text-text-2">
                <Icon size={13} />
                {label}
                {items.length > 0 && <span className="text-text-3">({items.length})</span>}
              </div>
              {items.length === 0 ? (
                <p className="mt-1.5 text-xs text-text-3">None</p>
              ) : (
                <ul className="mt-1.5 space-y-2">
                  {items.map((d, i) => (
                    <li key={i} className="text-xs text-text-2">
                      <span className="font-medium text-text">{d.subject}</span>
                      {d.type === "revised" && d.from && d.to && (
                        <div className="font-mono text-[11px] text-text-3 font-tabular">
                          {d.from} → {d.to}
                        </div>
                      )}
                      <div className="text-text-3">{d.reason}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
