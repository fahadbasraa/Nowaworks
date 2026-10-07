import clsx from "clsx";

const VARIANTS = {
  "role-admin": "bg-role-admin/10 text-role-admin",
  "role-manager": "bg-role-manager/10 text-role-manager",
  "role-agent": "bg-role-agent/10 text-role-agent",
  success: "bg-success/12 text-success",
  warning: "bg-warning/12 text-warning",
  danger: "bg-danger/12 text-danger",
  neutral: "bg-surface-2 text-text-2 border border-border",
};

export function Pill({ className, variant = "neutral", children, dot = false }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        VARIANTS[variant],
        className
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export function RolePill({ role, className }) {
  const map = { ADMIN: ["role-admin", "Admin"], MANAGER: ["role-manager", "Manager"], AGENT: ["role-agent", "Agent"] };
  const [variant, label] = map[role] ?? ["neutral", role];
  return (
    <Pill variant={variant} className={className}>
      {label}
    </Pill>
  );
}
