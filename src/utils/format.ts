export function formatINR(value: number, opts?: { compact?: boolean; decimals?: number }) {
  if (opts?.compact) return `₹${compactINR(value)}`;
  return `₹${value.toLocaleString("en-IN", {
    minimumFractionDigits: opts?.decimals ?? 0,
    maximumFractionDigits: opts?.decimals ?? 0,
  })}`;
}

export function compactINR(value: number) {
  const abs = Math.abs(value);
  if (abs >= 1_00_00_000) return `${(value / 1_00_00_000).toFixed(2)} Cr`;
  if (abs >= 1_00_000) return `${(value / 1_00_000).toFixed(2)} L`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(1)} K`;
  return value.toLocaleString("en-IN");
}

export function formatNumber(value: number, decimals = 0) {
  return value.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Indian date format DD/MM/YYYY from an ISO string. */
export function formatDate(iso: string) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

export function formatDateLong(iso: string) {
  if (!iso) return "—";
  const date = new Date(iso);
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function pct(value: number, decimals = 0) {
  return `${value.toFixed(decimals)}%`;
}
