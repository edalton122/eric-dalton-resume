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
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

/** Calendar-aware whole months between two dates (shared with roles.js math). */
export function monthsBetween(startStr, endStr) {
  const start = new Date(startStr);
  const end = endStr ? new Date(endStr) : new Date();
  return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
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
