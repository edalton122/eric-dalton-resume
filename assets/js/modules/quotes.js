// Recognition wall — content is static in index.html; this module adds
// the staggered entrance animation (§5.6). Avatar colors and the "6 of 6
// shown" counter are server-rendered since the dataset is fixed-size.

import { observeEntrance } from '../lib/observe.js';

export function initQuotes() {
  const grid = document.getElementById('quotes-grid');
  if (!grid) return;
  const cards = Array.from(grid.querySelectorAll('.q-card'));
  observeEntrance(cards, { stagger: 75, threshold: 0.08 }, (el) => el.classList.add('visible'));
}
