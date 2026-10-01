// Single shared IntersectionObserver factory — replaces v1's three separate
// ad-hoc observer instances (§3, rule 5). Supports an optional stagger so a
// group of sibling elements animates in sequence rather than all at once.

import { prefersReducedMotion } from './motion.js';

/**
 * @param {string|NodeList|Element[]} selectorOrEls
 * @param {object} opts - { threshold, rootMargin, stagger, once }
 * @param {(el: Element, index: number) => void} onEnter
 */
export function observeEntrance(selectorOrEls, opts, onEnter) {
  const { threshold = 0.12, rootMargin = '0px', stagger = 0, once = true } = opts || {};
  const els = typeof selectorOrEls === 'string'
    ? Array.from(document.querySelectorAll(selectorOrEls))
    : Array.from(selectorOrEls);

  if (!els.length) return null;

  // The stagger delay is itself a motion effect — a sequential reveal over
  // time — so it must be skipped under reduced motion, not just the CSS
  // transition that follows it (§4.3 / §8 reduced-motion acceptance check).
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const index = els.indexOf(entry.target);
        const delay = prefersReducedMotion() ? 0 : stagger * Math.max(0, index);
        if (delay > 0) setTimeout(() => onEnter(entry.target, index), delay);
        else onEnter(entry.target, index);
        if (once) io.unobserve(entry.target);
      }
    });
  }, { threshold, rootMargin });

  els.forEach((el) => io.observe(el));
  return io;
}

/** Fires `onEnter` once, the first time `el` crosses the given threshold. */
export function observeOnce(el, opts, onEnter) {
  const { threshold = 0.2, rootMargin = '0px' } = opts || {};
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        onEnter(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold, rootMargin });
  io.observe(el);
  return io;
}
