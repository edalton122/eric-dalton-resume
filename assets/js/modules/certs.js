// Certifications — content/tiers are static in index.html; this module
// computes the live Agentforce Specialist countdown and adds entrance
// animation (§5.7).

import { observeEntrance } from '../lib/observe.js';

const TARGET_DATE = '2027-01-31'; // FY27 Q4 end (Salesforce FY: Feb–Jan)

export function initCerts() {
  const grids = document.querySelectorAll('#certifications .certs-grid');
  grids.forEach((grid) => {
    const cards = Array.from(grid.querySelectorAll('.cert-card'));
    observeEntrance(cards, { stagger: 60, threshold: 0.1 }, (el) => el.classList.add('visible'));
  });

  const countdownEl = document.getElementById('cert-countdown');
  if (countdownEl) {
    const diff = new Date(TARGET_DATE) - new Date();
    const days = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    countdownEl.textContent = `${days.toLocaleString()} days remaining`;
  }
}
