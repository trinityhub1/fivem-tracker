export function formatPercent(current, max) {
  if (!max || max <= 0) return 0;
  return Math.min(100, Math.round((current / max) * 100));
}

export function pingClass(ping) {
  if (typeof ping !== "number" || Number.isNaN(ping)) return "";
  if (ping <= 60) return "is-low";
  if (ping <= 150) return "is-medium";
  return "is-high";
}

export function formatTime(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "—";
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function formatRelativeSeconds(seconds) {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ${seconds % 60}s`;
}

export function clampText(value, maxLength = 120) {
  if (typeof value !== "string") return "";
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value;
}

export function average(numbers) {
  if (!numbers.length) return 0;
  return Math.round(numbers.reduce((a, b) => a + b, 0) / numbers.length);
}
