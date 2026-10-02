// Revenue Performance Explorer — 4 views (ACV / Deals / Avg Deal Size /
// Cumulative), year drill-down, lazy-loaded self-hosted Chart.js (§5.3,
// §4.7). The HTML ships a real <table> as the default visible content;
// this module only swaps in the canvas once Chart.js has successfully
// loaded, and falls back to leaving the table visible if it hasn't (§4.8).

import { revenue, avgDealSize, cumulativeSeries } from '../../data/revenue.js';
import { loadWins } from '../../data/privacy.js';
import { prefersReducedMotion } from '../lib/motion.js';
import { observeOnce } from '../lib/observe.js';
import { formatUSD } from '../lib/format.js';
import { announce } from '../lib/a11y.js';

const VIEWS = ['acv', 'deals', 'avg', 'cumulative'];
let chart = null;
let selectedIndex = null;
let winsCache = null;

export function initChartExplorer() {
  const wrap = document.getElementById('chart-wrap');
  if (!wrap) return;

  wireTabs();
  wireDrilldownClose();

  observeOnce(wrap, { rootMargin: '400px', threshold: 0 }, () => loadChartJsAndRender());
}

function wireTabs() {
  const tablist = document.getElementById('chart-view-tabs');
  if (!tablist) return;
  const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => activateView(tab.dataset.view, tabs, tab));
    tab.addEventListener('keydown', (e) => {
      let next = null;
      if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = tabs.length - 1;
      if (next !== null) {
        e.preventDefault();
        tabs[next].focus();
        activateView(tabs[next].dataset.view, tabs, tabs[next]);
      }
    });
  });

  const saved = sessionStorage.getItem('chartView');
  if (saved && VIEWS.includes(saved)) {
    const tab = tabs.find(t => t.dataset.view === saved);
    if (tab) activateView(saved, tabs, tab, { skipRender: true });
  }
}

let currentView = 'avg';
function activateView(view, tabs, activeTab, { skipRender = false } = {}) {
  currentView = view;
  tabs.forEach(t => t.setAttribute('aria-selected', String(t === activeTab)));
  sessionStorage.setItem('chartView', view);
  document.getElementById('chart-annotation').hidden = view !== 'avg';
  if (!skipRender && chart) renderView(view);
}

async function loadChartJsAndRender() {
  const wrap = document.getElementById('chart-wrap');
  const table = document.getElementById('revenue-table');

  if (!window.Chart) {
    try {
      await loadScript('./assets/vendor/chart.umd.min.js');
    } catch {
      // Self-fallback to CDN if the vendored copy is somehow missing.
      try { await loadScript('https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'); }
      catch {
        const note = document.createElement('p');
        note.className = 'chart-note';
        note.textContent = 'Chart library unavailable — showing the data table above.';
        wrap.appendChild(note);
        return;
      }
    }
  }

  winsCache = await loadWins().catch(() => []);

  const canvas = document.createElement('canvas');
  canvas.id = 'revenueChart';
  canvas.tabIndex = 0;
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Revenue performance chart. Use the table above for exact figures.');
  wrap.insertBefore(canvas, table);
  table.classList.add('visually-hidden');

  canvas.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { moveSelection(1); e.preventDefault(); }
    else if (e.key === 'ArrowLeft') { moveSelection(-1); e.preventDefault(); }
    else if (e.key === 'Enter' && selectedIndex !== null) { openDrilldown(selectedIndex); e.preventDefault(); }
  });

  buildChart(canvas);
  renderView(currentView);
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

function moveSelection(delta) {
  const n = revenue.years.length;
  selectedIndex = selectedIndex === null ? 0 : (selectedIndex + delta + n) % n;
  announce(`${revenue.years[selectedIndex].fy} selected. Press Enter for detail.`);
}

function seriesForView(view) {
  switch (view) {
    case 'deals': return revenue.years.map(y => y.deals);
    case 'avg': return revenue.years.map(y => avgDealSize(y));
    case 'cumulative': return cumulativeSeries();
    default: return revenue.years.map(y => y.acv);
  }
}

function formatForView(view, v) {
  if (view === 'deals') return `${v}`;
  if (view === 'avg') return `$${Math.round(v).toLocaleString()}`;
  return v >= 1000000 ? `$${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : `$${v}`;
}

function buildChart(canvas) {
  const ctx = canvas.getContext('2d');
  const labels = revenue.years.map(y => y.fy);
  const data = seriesForView(currentView);
  const colors = revenue.years.map(y => y.partial ? 'rgba(1,118,211,0.35)' : 'rgba(1,118,211,0.82)');

  chart = new window.Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Value',
        data,
        backgroundColor: colors,
        borderRadius: 8,
        borderSkipped: false,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: prefersReducedMotion() ? false : { duration: 500 },
      onClick: (evt, elements) => {
        if (elements.length) openDrilldown(elements[0].index);
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#032D60',
          titleFont: { family: 'Inter', size: 13, weight: '700' },
          bodyFont: { family: 'Inter', size: 13 },
          padding: 14, cornerRadius: 8,
          callbacks: {
            label: (ctx2) => {
              const y = revenue.years[ctx2.dataIndex];
              const suffix = y.partial ? ' (YTD, partial year)' : '';
              return ` ${formatForView(currentView, ctx2.raw)}${suffix}`;
            },
          },
        },
      },
      scales: {
        x: { grid: { display: false }, border: { display: false }, ticks: { font: { family: 'Inter', size: 13, weight: '700' }, color: '#032D60' } },
        y: { grid: { color: '#F0F4F9' }, border: { display: false }, ticks: { font: { family: 'Inter', size: 12 }, color: '#6B7280', callback: v => formatForView(currentView, v) } },
      },
    },
  });
}

function renderView(view) {
  if (!chart) return;
  chart.data.datasets[0].data = seriesForView(view);
  chart.options.scales.y.ticks.callback = v => formatForView(view, v);
  chart.update(prefersReducedMotion() ? 'none' : 'active');
}

async function openDrilldown(index) {
  selectedIndex = index;
  const y = revenue.years[index];
  const panel = document.getElementById('drilldown-panel');
  document.getElementById('drilldown-fy').textContent = y.fy + (y.partial ? ' (YTD)' : '');
  document.getElementById('drilldown-period').textContent = y.period;
  document.getElementById('drilldown-stats').innerHTML = `
    <div><div class="drilldown-stat-val">${formatUSD(y.acv)}</div><div class="drilldown-stat-lbl">Closed ACV</div></div>
    <div><div class="drilldown-stat-val">${y.deals}</div><div class="drilldown-stat-lbl">Deals</div></div>
    <div><div class="drilldown-stat-val">${formatUSD(avgDealSize(y))}</div><div class="drilldown-stat-lbl">Avg Deal Size</div></div>
    <div><div class="drilldown-stat-val">${y.roleSpan}</div><div class="drilldown-stat-lbl">Role Held</div></div>
  `;
  document.getElementById('drilldown-headline').textContent = `"${y.headline}"`;

  const wins = winsCache || await loadWins().catch(() => []);
  const chipsEl = document.getElementById('drilldown-chips');
  const chips = [];
  (y.recognitionIds || []).forEach(() => {});
  if (y.recognitionIds?.length) {
    chips.push(`<span class="chip">Recognition: ${y.recognitionIds.length} this year</span>`);
  }
  (y.notableWinIds || []).forEach((id) => {
    const w = wins.find(w2 => w2.id === id);
    if (w) chips.push(`<span class="chip">${w.title}</span>`);
  });
  chipsEl.innerHTML = chips.join('');

  panel.classList.add('open');
  panel.focus?.();
  panel.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'nearest' });
}

function wireDrilldownClose() {
  const closeBtn = document.getElementById('drilldown-close');
  const panel = document.getElementById('drilldown-panel');
  if (!closeBtn || !panel) return;
  closeBtn.addEventListener('click', () => panel.classList.remove('open'));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains('open')) panel.classList.remove('open');
  });
}
