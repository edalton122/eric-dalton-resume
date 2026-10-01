// Currency/number/date formatters shared across modules — avoids five
// slightly-different ad-hoc `toLocaleString()` call sites (§3, rule 5).

export function formatUSD(n, { compact = false } = {}) {
  if (compact) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency: 'USD',
      notation: 'compact', maximumFractionDigits: 1,
    }).format(n);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0,
  }).format(n);
}

export function formatNumber(n) {
  return new Intl.NumberFormat('en-US').format(n);
}

export function formatMonthYear(dateStr) {
  const d = new Date(dateStr);
  // timeZone: 'UTC' matches how date-only ISO strings parse.
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
}

/** Calendar-aware whole months between two dates (shared with roles.js math).
 * Uses UTC getters — date-only ISO strings parse as UTC midnight, and
 * mixing that with local getMonth()/getFullYear() causes an off-by-one
 * month error in negative-UTC-offset zones. */
export function monthsBetween(startStr, endStr) {
  const start = new Date(startStr);
  const end = endStr ? new Date(endStr) : new Date();
  return (end.getUTCFullYear() - start.getUTCFullYear()) * 12 + (end.getUTCMonth() - start.getUTCMonth());
}

export function formatDuration(months) {
  const y = Math.floor(months / 12);
  const m = months % 12;
  const parts = [];
  if (y) parts.push(`${y} yr${y === 1 ? '' : 's'}`);
  if (m || !y) parts.push(`${m} mo${m === 1 ? '' : 's'}`);
  return parts.join(' ');
}

export function pluralize(n, singular, plural = `${singular}s`) {
  return n === 1 ? singular : plural;
}
