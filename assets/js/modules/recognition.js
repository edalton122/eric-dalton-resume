// "What Colleagues Say" — animated Slack-style shoutout wall. Content is
// server-rendered directly in index.html (already in tier-sorted order) so
// the section is fully readable with JS disabled; everything below is pure
// progressive enhancement: a staggered reveal with a typing-indicator beat,
// three sort/shuffle controls that reorder the live DOM, and a one-time
// confetti burst. No framework, no new dependency — same approach as every
// other animated module on this site.

import { observeEntrance, observeOnce } from '../lib/observe.js';
import { prefersReducedMotion } from '../lib/motion.js';

const TYPING_BEAT_MS = 480;
const REANIMATE_STAGGER_MS = 90;

export function initRecognition() {
  const wall = document.getElementById('shoutout-wall');
  if (!wall) return;

  const messages = Array.from(wall.querySelectorAll('.shoutout-msg'));
  if (!messages.length) return;

  revealOnScroll(messages);
  wireControls(wall, messages);
  wireSearch(messages);
  wireConfetti();
}

function revealOnScroll(messages) {
  observeEntrance(messages, { stagger: 180, threshold: 0.15 }, (el) => arriveMessage(el));
}

/** Shows the typing-indicator beat (unless reduced motion), then the bubble. */
function arriveMessage(el) {
  if (prefersReducedMotion()) {
    el.classList.add('visible');
    return;
  }
  el.classList.add('visible', 'typing');
  setTimeout(() => el.classList.remove('typing'), TYPING_BEAT_MS);
}

function wireControls(wall, messages) {
  const controls = document.getElementById('shoutout-controls');
  if (!controls) return;
  const sortButtons = Array.from(controls.querySelectorAll('[data-sort="tier"], [data-sort="technical"], [data-sort="recent"]'));
  const shuffleButton = controls.querySelector('[data-sort="shuffle"]');

  function setPressed(active) {
    sortButtons.forEach((btn) => {
      btn.setAttribute('aria-pressed', String(btn === active));
    });
  }

  // Shared tie-break for every non-random sort: tier descending, then
  // original (source-deck) order ascending — same hierarchy "Leadership
  // First" uses, so "Technical First" reads as a filtered view of the
  // same ranking rather than an unrelated ordering.
  function byTierThenOrder(a, b) {
    return Number(b.dataset.tier) - Number(a.dataset.tier) || Number(a.dataset.order) - Number(b.dataset.order);
  }

  function sortedBy(mode) {
    const items = messages.slice();
    if (mode === 'tier') {
      items.sort(byTierThenOrder);
    } else if (mode === 'technical') {
      items.sort((a, b) => {
        const techDiff = (b.dataset.technical === 'true' ? 1 : 0) - (a.dataset.technical === 'true' ? 1 : 0);
        return techDiff || byTierThenOrder(a, b);
      });
    } else if (mode === 'recent') {
      items.sort((a, b) => Number(b.dataset.order) - Number(a.dataset.order));
    } else {
      // Fisher–Yates shuffle — genuinely randomizes order, not just a
      // cosmetic re-sort, per the "show off the automation" ask.
      for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
      }
    }
    return items;
  }

  function applyOrder(items) {
    items.forEach((el) => wall.appendChild(el));
    reanimate(items);
  }

  sortButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      setPressed(btn);
      applyOrder(sortedBy(btn.dataset.sort));
    });
  });

  if (shuffleButton) {
    shuffleButton.addEventListener('click', () => {
      applyOrder(sortedBy('shuffle'));
    });
  }
}

const SEARCH_DEBOUNCE_MS = 150;

/** Live, debounced, case-insensitive substring filter on name — pure
 * show/hide, no re-animation (filtering isn't a "reorder" the way the sort
 * buttons are, so the stagger/typing beat would be the wrong signal here). */
function wireSearch(messages) {
  const input = document.getElementById('shoutout-search-input');
  if (!input) return;
  const names = messages.map((el) => el.querySelector('.shoutout-name').textContent.toLowerCase());

  let timer;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const query = input.value.trim().toLowerCase();
      messages.forEach((el, i) => {
        const isMatch = query.length === 0 || names[i].includes(query);
        el.classList.toggle('search-hidden', !isMatch);
        // A match further down the wall may never have scrolled into view
        // yet, so its entrance animation (and thus opacity:1) may never
        // have fired — force it visible so a search result is never
        // present-but-invisible.
        if (isMatch) el.classList.add('visible');
      });
    }, SEARCH_DEBOUNCE_MS);
  });
}

function reanimate(items) {
  items.forEach((el, i) => {
    el.classList.remove('visible', 'typing');
    if (prefersReducedMotion()) {
      el.classList.add('visible');
      return;
    }
    setTimeout(() => arriveMessage(el), i * REANIMATE_STAGGER_MS);
  });
}

function wireConfetti() {
  const heading = document.getElementById('recognition-heading');
  if (!heading) return;
  observeOnce(heading, { threshold: 0.5 }, () => {
    if (prefersReducedMotion()) return;
    burstConfetti();
  });
}

const CONFETTI_COLORS = ['#F4B942', '#1B96FF', '#0176D3', '#2E844A', '#C8900A', '#FFFFFF'];

/** Lightweight, zero-dependency canvas confetti burst — fires once, cleans
 * itself up, never intercepts pointer events. */
function burstConfetti() {
  const canvas = document.createElement('canvas');
  canvas.className = 'shoutout-confetti';
  canvas.setAttribute('aria-hidden', 'true');
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const count = 90;
  const originY = window.scrollY ? 160 : 160; // burst from just below the nav, independent of scroll offset since canvas is viewport-fixed
  const particles = Array.from({ length: count }, () => ({
    x: window.innerWidth / 2 + (Math.random() - 0.5) * 420,
    y: originY + (Math.random() - 0.5) * 40,
    vx: (Math.random() - 0.5) * 7,
    vy: Math.random() * -6 - 2,
    size: Math.random() * 6 + 4,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.3,
    shape: Math.random() > 0.5 ? 'rect' : 'circle',
  }));

  const gravity = 0.18;
  const drag = 0.995;
  const startTime = performance.now();
  const maxDuration = 2600;

  function tick(now) {
    const elapsed = now - startTime;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    particles.forEach((p) => {
      p.vx *= drag;
      p.vy = p.vy * drag + gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.65);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    if (elapsed < maxDuration) {
      requestAnimationFrame(tick);
    } else {
      canvas.remove();
    }
  }

  requestAnimationFrame(tick);
}
