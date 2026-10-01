// Nav chrome: scroll state, active-section highlighting, scroll progress,
// mobile drawer, back-to-top, section-jump pill, and the hero's functional
// tag chips + copy-link button (§5.1, §4.6, §6.5).

import { trapFocus, lockBodyScroll, announce } from '../lib/a11y.js';

const SECTION_IDS = ['hero', 'performance', 'timeline', 'wins', 'recognition', 'certifications', 'builds', 'future'];
const SECTION_LABELS = {
  hero: 'Intro', performance: 'Performance', timeline: 'Career', wins: 'Wins',
  recognition: 'Recognition', certifications: 'Credentials', builds: 'What I Build', future: 'Aspirations',
};

export function initNav() {
  initScrollChrome();
  initActiveSection();
  initMobileDrawer();
  initBackToTop();
  initHeroTags();
  initCopyLink();
  initPhotoRingPause();
}

function initScrollChrome() {
  const nav = document.getElementById('main-nav');
  const progress = document.getElementById('scroll-progress');
  if (!nav) return;

  function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 50);
    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      progress.style.width = `${pct}%`;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function initActiveSection() {
  const links = Array.from(document.querySelectorAll('.nav-links a, .nav-drawer-links a'));
  const pillLabel = document.getElementById('section-pill-label');
  const sections = SECTION_IDS.map(id => document.getElementById(id)).filter(Boolean);
  if (!sections.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      links.forEach((a) => {
        const match = a.getAttribute('href') === `#${id}`;
        a.toggleAttribute('aria-current', match);
        if (match) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      });
      if (pillLabel) pillLabel.textContent = SECTION_LABELS[id] || 'Menu';
    });
  }, { rootMargin: '-45% 0px -45% 0px' });

  sections.forEach(s => io.observe(s));
}

function initMobileDrawer() {
  const hamburger = document.getElementById('nav-hamburger');
  const drawer = document.getElementById('nav-drawer');
  const backdrop = document.getElementById('nav-drawer-backdrop');
  const closeBtn = document.getElementById('nav-drawer-close');
  const pill = document.getElementById('section-pill');
  if (!hamburger || !drawer || !backdrop) return;

  let releaseFocus = null;

  function open() {
    drawer.classList.add('open');
    backdrop.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    lockBodyScroll(true);
    releaseFocus = trapFocus(drawer);
  }
  function close({ returnFocus = true } = {}) {
    drawer.classList.remove('open');
    backdrop.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    lockBodyScroll(false);
    if (releaseFocus) releaseFocus();
    if (returnFocus) hamburger.focus();
  }

  hamburger.addEventListener('click', open);
  pill?.addEventListener('click', open);
  closeBtn.addEventListener('click', () => close());
  backdrop.addEventListener('click', () => close());
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => close({ returnFocus: false })));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) close();
  });
}

function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > window.innerHeight * 2);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

function initHeroTags() {
  document.querySelectorAll('.hero-tag[data-jump]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.jump;
      const target = document.getElementById(targetId);
      if (!target) return;
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });

      const filterProduct = btn.dataset.filterProduct;
      if (filterProduct) {
        window.dispatchEvent(new CustomEvent('gallery:filter-product', { detail: { product: filterProduct } }));
      }
      const flipId = btn.dataset.flip;
      if (flipId) {
        setTimeout(() => {
          const card = document.querySelector(`[data-win-id="${flipId}"]`);
          if (card) {
            card.setAttribute('aria-pressed', 'true');
            card.focus();
          }
        }, 500);
      }
    });
  });
}

function initCopyLink() {
  const btn = document.getElementById('copy-link-btn');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      announce('Link copied to clipboard');
      const original = btn.innerHTML;
      btn.innerHTML = btn.innerHTML.replace('Copy link', 'Copied!');
      setTimeout(() => { btn.innerHTML = original; }, 1800);
    } catch {
      announce('Could not copy link — please copy the URL manually');
    }
  });
}

/** Pause the hero photo-ring's conic-gradient rotation when it's offscreen. */
function initPhotoRingPause() {
  const ring = document.getElementById('photo-ring');
  if (!ring) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      ring.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused';
    });
  }, { threshold: 0 });
  io.observe(ring);
}
