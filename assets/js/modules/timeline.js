// Expandable career timeline — each row is a native disclosure
// (button[aria-expanded] + grid-template-rows panel), plus a scroll-linked
// progress fill on the vertical line (§5.4a).

import { roles, monthsInRole } from '../../data/roles.js';
import { prefersReducedMotion } from '../lib/motion.js';

export function initTimeline() {
  const wrap = document.getElementById('tl-wrap');
  if (!wrap) return;

  wireDisclosures();
  wireExpandAll();
  wireScrollProgress();
  updateCurrentMonths();
}

function wireDisclosures() {
  document.querySelectorAll('.tl-item .disclosure-trigger').forEach((trigger) => {
    const panel = document.getElementById(trigger.getAttribute('aria-controls'));
    if (!panel) return;
    trigger.addEventListener('click', () => toggle(trigger, panel));
  });
}

function toggle(trigger, panel, forceOpen = null) {
  const isOpen = forceOpen !== null ? forceOpen : trigger.getAttribute('aria-expanded') !== 'true';
  trigger.setAttribute('aria-expanded', String(isOpen));
  panel.classList.toggle('open', isOpen);
}

function wireExpandAll() {
  const btn = document.getElementById('tl-toggle-all');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const expand = btn.getAttribute('aria-expanded') !== 'true';
    document.querySelectorAll('.tl-item .disclosure-trigger').forEach((trigger) => {
      const panel = document.getElementById(trigger.getAttribute('aria-controls'));
      if (panel) toggle(trigger, panel, expand);
    });
    btn.setAttribute('aria-expanded', String(expand));
    btn.textContent = expand ? 'Collapse all' : 'Expand all';
  });
}

function wireScrollProgress() {
  const wrap = document.getElementById('tl-wrap');
  const fill = document.getElementById('tl-line-progress');
  if (!wrap || !fill || prefersReducedMotion()) return;

  let ticking = false;
  function update() {
    const rect = wrap.getBoundingClientRect();
    const vh = window.innerHeight;
    const total = rect.height;
    const visibleStart = Math.min(Math.max(vh * 0.5 - rect.top, 0), total);
    fill.style.height = `${(visibleStart / total) * 100}%`;
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });
  update();
}

function updateCurrentMonths() {
  const el = document.getElementById('tl-current-months');
  const current = roles.find(r => r.current);
  if (el && current) el.textContent = `${monthsInRole(current)} mo`;
}
