// Promotion velocity bars — bar widths are computed live from
// assets/data/roles.js (never hardcoded), animated on scroll-into-view
// (§5.4b). HTML ships with pre-computed `data-pct` values as the no-JS/
// pre-paint fallback so the bars aren't empty before JS runs.

import { roles, monthsInRole, totalSalesforceMonths } from '../../data/roles.js';
import { animateBar } from '../lib/motion.js';
import { observeOnce } from '../lib/observe.js';
import { formatDuration } from '../lib/format.js';

export function initVelocity() {
  const wrap = document.getElementById('velocity-wrap');
  if (!wrap) return;

  const today = new Date();
  const maxMonths = Math.max(...roles.map(r => monthsInRole(r, today)));
  const rows = Array.from(wrap.querySelectorAll('.velocity-row'));

  rows.forEach((row, i) => {
    const roleId = row.dataset.roleId;
    const role = roles.find(r => r.id === roleId);
    if (!role) return;
    const months = monthsInRole(role, today);
    const pct = Math.round((months / maxMonths) * 100);
    const bar = row.querySelector('.velocity-bar');
    if (bar) bar.dataset.pct = String(pct);

    const monthsEl = row.querySelector('.velocity-months');
    if (monthsEl && role.current) monthsEl.textContent = `${months} mo+`;
  });

  const totalMonthsEl = document.getElementById('velocity-total-months');
  if (totalMonthsEl) totalMonthsEl.textContent = `${totalSalesforceMonths(today)} months`;

  const currentMonthsEl = document.getElementById('velocity-current-months');
  const current = roles.find(r => r.current);
  if (currentMonthsEl && current) currentMonthsEl.textContent = `${monthsInRole(current, today)} mo+`;

  buildTable();
  wireTableToggle();

  observeOnce(wrap, { threshold: 0.2 }, () => {
    rows.forEach((row, i) => {
      const bar = row.querySelector('.velocity-bar');
      if (bar) animateBar(bar, parseFloat(bar.dataset.pct || '0'), 'width', i * 100);
    });
  });

  function buildTable() {
    const tbody = document.getElementById('velocity-table-body');
    if (!tbody) return;
    // timeZone: 'UTC' matches how the date-only ISO strings were parsed —
    // without it, negative-UTC-offset viewers see the previous day/month.
    const fmt = { month: 'short', year: 'numeric', timeZone: 'UTC' };
    tbody.innerHTML = roles.map(r => {
      const start = new Date(r.start).toLocaleDateString('en-US', fmt);
      const end = r.end ? new Date(r.end).toLocaleDateString('en-US', fmt) : 'Present';
      const months = monthsInRole(r, today);
      return `<tr><td>${r.title}</td><td>${start}</td><td>${end}</td><td>${formatDuration(months)}</td></tr>`;
    }).join('');
  }

  function wireTableToggle() {
    const btn = document.getElementById('velocity-table-toggle');
    const panel = document.getElementById('velocity-table-wrap');
    if (!btn || !panel) return;
    btn.addEventListener('click', () => {
      const open = panel.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? 'Hide table' : 'View as table';
    });
  }
}
