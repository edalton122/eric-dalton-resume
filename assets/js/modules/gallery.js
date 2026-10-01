// Filterable "What I Build" project gallery (§5.8). All 21 cards are
// static in index.html (readable with JS disabled, per the noscript note
// in the filter bar); this module adds category + tool + text filtering,
// AND across facets / OR within a facet, a live result count, and a
// shareable URL-hash filter state.

import { announce } from '../lib/a11y.js';

export function initGallery() {
  const grid = document.getElementById('projects-grid');
  const filterBar = document.getElementById('filter-bar');
  if (!grid || !filterBar) return;

  const cards = Array.from(grid.querySelectorAll('.project-card'));
  const catButtons = Array.from(filterBar.querySelectorAll('[data-filter-cat]'));
  const toolButtons = Array.from(filterBar.querySelectorAll('[data-filter-tool]'));
  const search = document.getElementById('project-search');
  const countEl = document.getElementById('filter-count');

  const state = { cat: 'all', tools: new Set(), q: '' };

  function applyFromHash() {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    if (params.has('cat')) state.cat = params.get('cat');
    if (params.has('tools')) state.tools = new Set(params.get('tools').split(',').filter(Boolean));
    if (params.has('q')) { state.q = params.get('q'); search.value = state.q; }
  }

  function syncHash() {
    const params = new URLSearchParams();
    if (state.cat !== 'all') params.set('cat', state.cat);
    if (state.tools.size) params.set('tools', Array.from(state.tools).join(','));
    if (state.q) params.set('q', state.q);
    const hash = params.toString();
    history.replaceState(null, '', hash ? `#${hash}` : window.location.pathname + window.location.search);
  }

  function render() {
    let visible = 0;
    cards.forEach((card) => {
      const cat = card.dataset.category;
      const tools = (card.dataset.tools || '').split(',').filter(Boolean);
      const products = (card.dataset.products || '').split(',').filter(Boolean);
      const haystack = (tools.concat(products)).map(s => s.toLowerCase());

      const catMatch = state.cat === 'all' || cat === state.cat;
      const toolMatch = state.tools.size === 0 || Array.from(state.tools).some(t => haystack.includes(t.toLowerCase()));
      const text = (card.textContent || '').toLowerCase();
      const qMatch = !state.q || text.includes(state.q.toLowerCase());

      const show = catMatch && toolMatch && qMatch;
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });

    catButtons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.filterCat === state.cat)));
    toolButtons.forEach(b => b.setAttribute('aria-pressed', String(state.tools.has(b.dataset.filterTool))));

    if (countEl) countEl.textContent = `${visible} ${visible === 1 ? 'project' : 'projects'}`;
    announce(`${visible} ${visible === 1 ? 'project' : 'projects'} shown`);
    syncHash();
  }

  catButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      state.cat = btn.dataset.filterCat;
      render();
    });
  });

  toolButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const tool = btn.dataset.filterTool;
      if (state.tools.has(tool)) state.tools.delete(tool); else state.tools.add(tool);
      render();
    });
  });

  let searchTimer = null;
  search?.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { state.q = search.value.trim(); render(); }, 180);
  });

  // Hero "Agentforce" / "Data Cloud" / "Revenue Cloud" tag chips jump here
  // and apply a single-product filter (§5.1).
  window.addEventListener('gallery:filter-product', (e) => {
    const product = e.detail?.product;
    if (!product) return;
    state.cat = 'all';
    state.tools = new Set([product]);
    render();
  });

  applyFromHash();
  render();
}
