const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDateOnly(value) {
  if (typeof value !== "string" || !DATE_ONLY_RE.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function parseDateOnly(value) {
  if (!isValidDateOnly(value)) {
    throw new Error(`Invalid date: ${value}`);
  }
  return new Date(`${value}T00:00:00Z`);
}

export function formatDateOnly(date) {
  return date.toISOString().slice(0, 10);
}
