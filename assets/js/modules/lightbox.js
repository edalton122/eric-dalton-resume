// Photo lightbox (§5.9) — reads the photo list directly from the static
// .p-item markup (src/alt/caption already live in the HTML; no duplicate
// data file needed for six fixed images). Dialog with focus trap, prev/
// next, arrow-key + swipe navigation, Escape, and adjacent-image preload.

import { trapFocus } from '../lib/a11y.js';

export function initLightbox() {
  const items = Array.from(document.querySelectorAll('.p-item'));
  const dialog = document.getElementById('lightbox-dialog');
  if (!items.length || !dialog) return;

  const photos = items.map((btn) => {
    const img = btn.querySelector('img');
    const cap = btn.querySelector('.p-cap');
    return { src: img.src, alt: img.alt, caption: cap?.textContent || '' };
  });

  const imgEl = document.getElementById('lightbox-img');
  const captionEl = document.getElementById('lightbox-caption');
  const counterEl = document.getElementById('lightbox-counter');
  const closeBtn = document.getElementById('lightbox-close');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');

  let index = 0;
  let releaseFocus = null;
  let triggerEl = null;

  function show(i) {
    index = (i + photos.length) % photos.length;
    const p = photos[index];
    imgEl.src = p.src;
    imgEl.alt = p.alt;
    captionEl.textContent = p.caption;
    counterEl.textContent = `${index + 1} of ${photos.length}`;
    preload(index + 1);
    preload(index - 1);
  }

  function preload(i) {
    const p = photos[(i + photos.length) % photos.length];
    const im = new Image();
    im.src = p.src;
  }

  function open(i, trigger) {
    triggerEl = trigger;
    show(i);
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    releaseFocus = trapFocus(dialog);
  }

  function close() {
    dialog.close?.();
    dialog.removeAttribute('open');
    if (releaseFocus) releaseFocus();
    triggerEl?.focus();
  }

  items.forEach((btn, i) => {
    btn.addEventListener('click', () => open(i, btn));
  });

  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', () => show(index - 1));
  nextBtn.addEventListener('click', () => show(index + 1));
  dialog.addEventListener('click', (e) => { if (e.target === dialog) close(); });
  dialog.addEventListener('cancel', (e) => { e.preventDefault(); close(); });

  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') show(index + 1);
    else if (e.key === 'ArrowLeft') show(index - 1);
    else if (e.key === 'Escape') close();
  });

  // Basic swipe support
  let touchStartX = null;
  dialog.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  dialog.addEventListener('touchend', (e) => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) show(index + (dx < 0 ? 1 : -1));
    touchStartX = null;
  }, { passive: true });
}
