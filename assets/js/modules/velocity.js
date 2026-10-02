// Promotion velocity bars — bar widths are computed live from
// assets/data/roles.js (never hardcoded), animated on scroll-into-view
// (§5.4b). HTML ships with pre-computed `data-pct` values as the no-JS/
// pre-paint fallback so the bars aren't empty before JS runs.

import { roles, monthsInRole, totalSalesforceMonths } from '../../data/roles.js';
import { animateBar } from '../lib/motion.js';
import { observeOnce } from '../lib/observe.js';
import { formatDuration, formatMonthYear } from '../lib/format.js';

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

    attachTooltip(row, role, months);
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

  /** Shared by buildTable() and the hover/focus tooltip, so the two never
   * drift to slightly different date wording. */
  function roleDateRange(role) {
    const start = formatMonthYear(role.start);
    const end = role.end ? formatMonthYear(role.end) : 'Present';
    return { start, end, label: `${start} – ${end}` };
  }

  function buildTable() {
    const tbody = document.getElementById('velocity-table-body');
    if (!tbody) return;
    tbody.innerHTML = roles.map(r => {
      const { start, end } = roleDateRange(r);
      const months = monthsInRole(r, today);
      return `<tr><td>${r.title}</td><td>${start}</td><td>${end}</td><td>${formatDuration(months)}</td></tr>`;
    }).join('');
  }

  /** Builds the hover/focus tooltip this feature was missing entirely —
   * exact date range + up to 2 real outcomes straight from roles.js, no
   * invented content. Shown via :hover/:focus-within in sections.css, the
   * same pattern .flip-card already uses, rather than a JS show/hide
   * toggle — one tooltip per row (not a single repositioning one) keeps
   * this a pure-CSS interaction with no mouseenter/focus bookkeeping. */
  function attachTooltip(row, role, months) {
    const { label } = roleDateRange(role);
    const tipId = `velocity-tip-${role.id}`;
    const outcomes = (role.outcomes || []).slice(0, 2);

    const tip = document.createElement('div');
    tip.className = 'tooltip velocity-tooltip';
    tip.id = tipId;
    tip.setAttribute('role', 'tooltip');
    tip.innerHTML = `
      <div class="velocity-tooltip-dates">${label} · ${formatDuration(months)}</div>
      ${outcomes.length ? `<ul class="tl-outcomes">${outcomes.map((o) => `<li>${o}</li>`).join('')}</ul>` : ''}
    `;
    row.appendChild(tip);

    // tabindex + aria-describedby are what actually make "focus a bar"
    // possible — a plain, non-interactive div is unreachable by keyboard
    // otherwise, which is the second reason this never worked before.
    row.setAttribute('tabindex', '0');
    row.setAttribute('aria-describedby', tipId);

    // The tooltip opens above the row by default (matches most scroll
    // positions, since this section usually isn't jammed against the top
    // of the viewport) — but if a row IS scrolled in close under the
    // sticky nav, opening upward would clip it off-screen. Checked live
    // on hover/focus rather than baked in at build time, since it depends
    // on scroll position, not row index.
    const flipIfTight = () => {
      tip.classList.toggle('velocity-tooltip--below', row.getBoundingClientRect().top < 150);
    };
    row.addEventListener('mouseenter', flipIfTight);
    row.addEventListener('focus', flipIfTight);
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
