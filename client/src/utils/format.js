export function formatDate(dateInput) {
  const d = new Date(dateInput);
  const day = d.getUTCDate();
  const month = d.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
  const year = d.getUTCFullYear();
  return `${day} ${month} ${year}`;
}

export function formatHours(hours) {
  return `${hours}h`;
}

export function daysLeft(dateInput) {
  const now = new Date();
  const target = new Date(dateInput);
  const utcNow = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const utcTarget = Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate());
  return Math.round((utcTarget - utcNow) / 86400000);
}

export function initials(name) {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

const AVATAR_PALETTE = ["#8B7CFF", "#93C5FD", "#86EFAC", "#FBBF24", "#F87171", "#C4B5FD", "#67E8F9", "#FDA4AF"];

export function colorFromName(name) {
  if (!name) return AVATAR_PALETTE[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

export const ROLE_META = {
  ADMIN: { label: "Admin", color: "var(--color-role-admin)" },
  MANAGER: { label: "Manager", color: "var(--color-role-manager)" },
  AGENT: { label: "Agent", color: "var(--color-role-agent)" },
};
