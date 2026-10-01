// Signature Wins flip cards — content is static in index.html (per the
// "no JS-only content" rule); this module only adds the flip interaction,
// reusing the same pattern as numbers.js (§5.5).

import { wireFlip } from './numbers.js';
import { observeEntrance } from '../lib/observe.js';

export function initWins() {
  const grid = document.getElementById('wins-grid');
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll('.flip-card'));
  cards.forEach(wireFlip);

  observeEntrance(cards, { stagger: 75, threshold: 0.08 }, (el) => el.classList.add('visible'));
}
