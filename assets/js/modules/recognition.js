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
  const spotlight = wireSpotlight(messages);
  wireControls(wall, messages, spotlight);
  wireSearch(messages, spotlight);
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

function wireControls(wall, messages, spotlight) {
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
    if (spotlight) {
      // Keep the avatar rail's top-to-bottom order matching the list's new
      // order (it's a minimap, not a fixed index), then re-sync the active
      // card to whatever is now centered post-reorder.
      spotlight.reorderRail(items);
      spotlight.resync();
    }
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
function wireSearch(messages, spotlight) {
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
      // A filter can hide the card the spotlight was pointing at — re-sync
      // so it never shows a now-hidden person.
      if (spotlight) spotlight.resync();
    }, SEARCH_DEBOUNCE_MS);
  });
}

const SPOTLIGHT_SWITCH_MS = 160; // matches --dur-fast

/**
 * Sticky "spotlight" panel that mirrors whichever `.shoutout-msg` card is
 * most centered in the viewport (classic scrollspy), fed by the same
 * IntersectionObserver technique as lib/observe.js rather than a second,
 * scroll-listener-based tracking system. Returns null if the panel markup
 * isn't present (e.g. stripped out), so callers can treat it as optional.
 */
function wireSpotlight(messages) {
  const panel = document.getElementById('shoutout-spotlight');
  const card = document.getElementById('spotlight-card');
  const rail = document.getElementById('spotlight-rail');
  if (!panel || !card || !rail) return null;

  const railItems = Array.from(rail.querySelectorAll('.spotlight-rail-item'));
  const railByTarget = new Map(railItems.map((btn) => [btn.dataset.target, btn]));

  // Default DOM order on load is already tier-sorted, so the first message
  // is Daniel Loughran — exactly what's pre-rendered in the panel's static
  // HTML, keeping JS and no-JS states in agreement from the first frame.
  let activeEl = messages[0];

  function render(el) {
    const avatarSrc = el.querySelector('.shoutout-avatar');
    const avatar = document.getElementById('spotlight-avatar');
    avatar.style.background = avatarSrc.style.background;
    avatar.style.color = avatarSrc.style.color;
    avatar.textContent = avatarSrc.textContent;

    document.getElementById('spotlight-name').innerHTML = el.querySelector('.shoutout-name').innerHTML;

    const titleSrc = el.querySelector('.shoutout-title');
    const titleEl = document.getElementById('spotlight-title');
    titleEl.textContent = titleSrc ? titleSrc.textContent : '';
    titleEl.style.display = titleSrc ? '' : 'none';

    const badgeSrc = el.querySelector('.shoutout-tech-badge');
    document.getElementById('spotlight-badges').innerHTML = badgeSrc ? badgeSrc.outerHTML : '';

    document.getElementById('spotlight-text').textContent = el.querySelector('.shoutout-text').textContent;

    card.classList.remove('tier-1', 'tier-2', 'tier-3');
    card.classList.add(`tier-${el.dataset.tier}`);
  }

  function setActive(el, { instant = false } = {}) {
    if (!el || el === activeEl) return;
    activeEl = el;

    railItems.forEach((btn) => {
      const isActive = btn.dataset.target === el.dataset.id;
      btn.classList.toggle('active', isActive);
      if (isActive) btn.setAttribute('aria-current', 'true');
      else btn.removeAttribute('aria-current');
    });

    if (instant || prefersReducedMotion()) {
      render(el);
      return;
    }
    card.classList.add('is-switching');
    setTimeout(() => {
      render(el);
      card.classList.remove('is-switching');
    }, SPOTLIGHT_SWITCH_MS);
  }

  function isRoughlyInViewport(el) {
    const rect = el.getBoundingClientRect();
    return rect.bottom > 0 && rect.top < window.innerHeight;
  }

  function pickClosestToCenter(candidates) {
    const center = window.innerHeight / 2;
    let best = candidates[0];
    let bestDist = Infinity;
    candidates.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const dist = Math.abs((rect.top + rect.bottom) / 2 - center);
      if (dist < bestDist) {
        bestDist = dist;
        best = el;
      }
    });
    return best;
  }

  // A thin band at the vertical center of the viewport (±~10% around the
  // middle) stands in for "most centered" — whichever card crosses into
  // that band is the active one. Ties (more than one card in the band at
  // once) are broken by actual distance-to-center at callback time.
  //
  // navLock suppresses this auto-tracking for the duration of a rail
  // click's smooth-scroll animation. Without it, the observer would fire
  // repeatedly for whichever cards transit the center band *while the
  // scroll is still animating toward the clicked target* and could settle
  // on the wrong one — the explicit click should win outright, not race
  // the scroll-in-progress.
  let navLock = false;

  const centered = new Set();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) centered.add(entry.target);
      else centered.delete(entry.target);
    });
    if (navLock) return;
    const candidates = Array.from(centered).filter((el) => !el.classList.contains('search-hidden'));
    if (candidates.length) setActive(pickClosestToCenter(candidates));
  }, { threshold: 0, rootMargin: '-40% 0px -40% 0px' });
  messages.forEach((el) => io.observe(el));

  /** Polls actual scroll position (rather than trusting the `scrollend`
   * event's exact timing, which can fire a touch early relative to a long
   * smooth-scroll animation's true rest point) until it stops changing,
   * then runs `onSettled`. Capped so it can never hang indefinitely. */
  function onceScrollSettles(onSettled) {
    let lastY = window.scrollY;
    let stableFrames = 0;
    let framesElapsed = 0;
    const maxFrames = 180; // ~3s safety cap at 60fps
    function tick() {
      framesElapsed += 1;
      const y = window.scrollY;
      if (Math.abs(y - lastY) < 1) {
        stableFrames += 1;
      } else {
        stableFrames = 0;
        lastY = y;
      }
      if (stableFrames >= 4 || framesElapsed >= maxFrames) {
        onSettled();
        return;
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  railItems.forEach((btn) => {
    btn.addEventListener('click', () => {
      const el = messages.find((m) => m.dataset.id === btn.dataset.target);
      if (!el || el.classList.contains('search-hidden')) return;
      setActive(el, { instant: true });
      navLock = true;
      el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' });
      onceScrollSettles(() => {
        navLock = false;
        // Resolve unambiguously from the wall's true settled geometry
        // rather than trusting whichever observer callback happened to
        // land last during (or immediately after) the scroll.
        const nonHidden = messages.filter((m) => !m.classList.contains('search-hidden'));
        const inView = nonHidden.filter(isRoughlyInViewport);
        const candidates = inView.length ? inView : nonHidden;
        if (candidates.length) setActive(pickClosestToCenter(candidates));
      });
    });
  });

  return {
    /** Keeps the rail's visual order matching the list's current order
     * after a sort/shuffle, so it still reads as a minimap. */
    reorderRail(items) {
      items.forEach((el) => {
        const btn = railByTarget.get(el.dataset.id);
        if (btn) rail.appendChild(btn);
      });
    },
    /** Re-picks the active card from fresh geometry — used after a sort or
     * a search filter, where the IntersectionObserver's cached membership
     * may be stale relative to the just-changed layout/visibility. Never
     * selects a search-hidden card. */
    resync() {
      requestAnimationFrame(() => {
        const nonHidden = messages.filter((el) => !el.classList.contains('search-hidden'));
        if (!nonHidden.length) return;
        const inView = nonHidden.filter(isRoughlyInViewport);
        const candidates = inView.length ? inView : nonHidden;
        setActive(pickClosestToCenter(candidates), { instant: true });
      });
    },
  };
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
