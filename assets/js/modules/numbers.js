// "By the Numbers" — rAF count-up (lib/motion.js) + shared flip-card
// interaction pattern reused by wins.js (§5.2, §5.5).

import { countUp } from '../lib/motion.js';
import { observeOnce } from '../lib/observe.js';
import { yearsAtSalesforce } from '../../data/profile.js';

export function initNumbers() {
  const grid = document.getElementById('numbers-grid');
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll('.flip-card'));
  cards.forEach((card, i) => wireFlip(card, i));

  // Never hardcode a derived number — overwrite the HTML's static
  // (correct-as-of-today) fallback with a live computation.
  const yearsEl = document.querySelector('#num-years [data-count]');
  if (yearsEl) yearsEl.dataset.target = String(yearsAtSalesforce());

  observeOnce(grid, { threshold: 0.25 }, () => {
    cards.forEach((card, i) => {
      const el = card.querySelector('[data-count]');
      if (!el) return;
      const target = parseFloat(el.dataset.target);
      countUp(el, target, {
        prefix: el.dataset.prefix || '',
        suffix: el.dataset.suffix || '',
        decimals: parseInt(el.dataset.decimals || '0', 10),
        duration: 1400,
        delay: i * 70,
      });
    });
  });
}

/** Shared click/Enter/Space flip toggle — also used by wins.js. */
export function wireFlip(card, index = 0) {
  function toggle() {
    const pressed = card.getAttribute('aria-pressed') === 'true';
    card.setAttribute('aria-pressed', String(!pressed));
  }
  card.addEventListener('click', toggle);
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle();
    }
  });
}
