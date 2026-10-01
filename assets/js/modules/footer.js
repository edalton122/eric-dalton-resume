// Footer actions + the handful of "live-computed" strings that appear
// outside the numbers/chart/velocity modules (hero "Currently" strip,
// future-section pipeline + as-of date, chart as-of label, footer privacy
// notice). All values trace to data/profile.js and data/revenue.js — the
// HTML ships correct-as-of-today values as the no-JS fallback; this just
// keeps them from going stale.

import { profile } from '../../data/profile.js';
import { revenue } from '../../data/revenue.js';
import { roles, monthsInRole } from '../../data/roles.js';
import { privacyNotice } from '../../data/privacy.js';
import { formatUSD } from '../lib/format.js';

export function initFooter() {
  wirePrintButton();
  updatePrivacyNotice();
  updateLiveStrip();
  updateFutureStats();
  updateAsOfLabels();
}

function wirePrintButton() {
  document.getElementById('footer-print')?.addEventListener('click', () => window.print());
}

function updatePrivacyNotice() {
  const el = document.getElementById('footer-privacy-note');
  const notice = privacyNotice();
  if (el && notice) el.textContent = notice;
}

function updateLiveStrip() {
  const strip = document.getElementById('hero-live-strip');
  if (!strip) return;
  const current = roles.find(r => r.current);
  const fy27 = revenue.years.find(y => y.fy === 'FY27 YTD');
  const months = current ? monthsInRole(current) : null;

  strip.innerHTML = `
    <span><span class="hero-live-dot" aria-hidden="true"></span><strong>Currently:</strong> ${profile.title}, CBS New Logo</span>
    <span>FY27 YTD <strong>${formatUSD(fy27.acv)}</strong> across <strong>${fy27.deals} deals</strong></span>
    <span><strong>${formatUSD(profile.openPipeline, { compact: true })}+</strong> open pipeline</span>
    ${months !== null ? `<span><strong>${months} mo</strong> in current role</span>` : ''}
  `;
}

function updateFutureStats() {
  const pipelineEl = document.getElementById('future-pipeline');
  if (pipelineEl) pipelineEl.textContent = `${formatUSD(profile.openPipeline, { compact: true })}+`;
  const asOfEl = document.getElementById('future-asof');
  if (asOfEl) asOfEl.textContent = formatMonthYear(profile.asOf);
}

function updateAsOfLabels() {
  const el = document.getElementById('asof-label');
  if (el) el.textContent = formatMonthYear(profile.asOf);
}

function formatMonthYear(iso) {
  // timeZone: 'UTC' matches how date-only ISO strings parse — without it,
  // negative-UTC-offset viewers can see the previous day/month.
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}
