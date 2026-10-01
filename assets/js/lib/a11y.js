// Focus trap, roving tabindex, and a live-region announcer — shared by the
// mobile drawer, modals, dialogs, and any filtered-content section (§4.3).

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Traps focus within `container` while active. Returns a release function.
 */
export function trapFocus(container) {
  const getFocusable = () => Array.from(container.querySelectorAll(FOCUSABLE))
    .filter(el => el.offsetParent !== null);

  function onKeydown(e) {
    if (e.key !== 'Tab') return;
    const focusable = getFocusable();
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }

  container.addEventListener('keydown', onKeydown);
  const focusable = getFocusable();
  if (focusable.length) focusable[0].focus();

  return () => container.removeEventListener('keydown', onKeydown);
}

/** 2D/1D roving tabindex for grids and tab lists (arrow-key navigation). */
export function rovingTabindex(container, itemSelector, { horizontal = true, vertical = false, columns = 1 } = {}) {
  const items = () => Array.from(container.querySelectorAll(itemSelector));
  items().forEach((el, i) => el.setAttribute('tabindex', i === 0 ? '0' : '-1'));

  container.addEventListener('keydown', (e) => {
    const list = items();
    const current = list.indexOf(document.activeElement);
    if (current === -1) return;
    let next = current;

    if (horizontal && e.key === 'ArrowRight') next = current + 1;
    else if (horizontal && e.key === 'ArrowLeft') next = current - 1;
    else if (vertical && e.key === 'ArrowDown') next = current + columns;
    else if (vertical && e.key === 'ArrowUp') next = current - columns;
    else return;

    next = Math.max(0, Math.min(list.length - 1, next));
    if (next === current) return;
    e.preventDefault();
    list.forEach(el => el.setAttribute('tabindex', '-1'));
    list[next].setAttribute('tabindex', '0');
    list[next].focus();
  });
}

/** One shared visually-hidden live region for polite announcements. */
let liveRegion = null;
export function announce(message) {
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.setAttribute('role', 'status');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.className = 'visually-hidden';
    document.body.appendChild(liveRegion);
  }
  liveRegion.textContent = '';
  // Re-set on a frame so repeated identical messages still announce.
  requestAnimationFrame(() => { liveRegion.textContent = message; });
}

export function lockBodyScroll(lock) {
  document.body.style.overflow = lock ? 'hidden' : '';
}
