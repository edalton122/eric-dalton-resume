// Hero photo rail (§2.2) — the explicit pause/play control for the
// auto-scrolling marquee. :hover/:focus-within pausing is handled in pure
// CSS (sections.css); this is the actual WCAG 2.2.2 affordance, since a
// sighted mouse user who isn't hovering or focused anywhere in the rail
// still needs a way to stop motion that runs longer than 5 seconds.

import { prefersReducedMotion } from '../lib/motion.js';

export function initPhotoRail() {
  const rail = document.getElementById('hero-photo-rail');
  const toggle = document.getElementById('rail-pause-toggle');
  if (!rail || !toggle) return;

  if (prefersReducedMotion()) {
    // Nothing is moving under reduced motion — the control has nothing to do.
    toggle.style.display = 'none';
    return;
  }

  const label = toggle.querySelector('.visually-hidden');

  toggle.addEventListener('click', () => {
    const paused = rail.classList.toggle('paused');
    toggle.setAttribute('aria-pressed', String(paused));
    if (label) label.textContent = paused ? 'Resume photo scroll' : 'Pause photo scroll';
  });
}
