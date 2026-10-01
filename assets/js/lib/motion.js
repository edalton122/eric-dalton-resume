// Reduced-motion helper + a single rAF-based count-up used by every
// animated numeric display on the site (§4.3, §5.2). Replaces v1's
// setInterval-at-60fps implementation with elapsed-time-based progress,
// so animation speed is consistent regardless of frame rate.

const mql = window.matchMedia('(prefers-reduced-motion: reduce)');

export function prefersReducedMotion() {
  return mql.matches;
}

export function onReducedMotionChange(cb) {
  mql.addEventListener('change', () => cb(mql.matches));
}

function easeOutExpo(t) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/**
 * Animates `el.textContent` from 0 to `target` over `duration`ms.
 * @param {HTMLElement} el
 * @param {number} target
 * @param {object} opts - { prefix, suffix, decimals, duration, delay, formatter }
 */
export function countUp(el, target, opts = {}) {
  const { prefix = '', suffix = '', decimals = 0, duration = 1400, delay = 0, formatter } = opts;

  const render = (value) => {
    if (formatter) return formatter(value);
    const n = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString();
    return `${prefix}${n}${suffix}`;
  };

  if (prefersReducedMotion()) {
    el.textContent = render(target);
    return;
  }

  setTimeout(() => {
    const start = performance.now();
    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value = target * easeOutExpo(progress);
      el.textContent = render(value);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, delay);
}

/** Animate a 0%→target% width/height transition respecting reduced motion. */
export function animateBar(el, targetPercent, property = 'width', delay = 0) {
  if (prefersReducedMotion()) {
    el.style[property] = `${targetPercent}%`;
    return;
  }
  setTimeout(() => { el.style[property] = `${targetPercent}%`; }, delay);
}
