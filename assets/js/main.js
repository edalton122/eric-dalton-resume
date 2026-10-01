// Entry point — imports and boots every module. The very first thing it
// does is add `js-enabled` to <html>; base.css's hidden entrance states
// only apply once that class is present, so a JS failure anywhere below
// this line still leaves a fully visible, readable page (§4.8).

document.documentElement.classList.add('js-enabled');

import { initNav } from './modules/nav.js';
import { initNumbers } from './modules/numbers.js';
import { initChartExplorer } from './modules/chart-explorer.js';
import { initVelocity } from './modules/velocity.js';
import { initTimeline } from './modules/timeline.js';
import { initWins } from './modules/wins.js';
import { initRecognition } from './modules/recognition.js';
import { initCerts } from './modules/certs.js';
import { initGallery } from './modules/gallery.js';
import { initLightbox } from './modules/lightbox.js';
import { initPhotoRail } from './modules/photo-rail.js';
import { initFooter } from './modules/footer.js';
import { observeEntrance } from './lib/observe.js';

function safeInit(name, fn) {
  try {
    fn();
  } catch (err) {
    console.error(`[main.js] ${name} failed to initialize:`, err);
  }
}

safeInit('nav', initNav);
safeInit('numbers', initNumbers);
safeInit('chart-explorer', initChartExplorer);
safeInit('velocity', initVelocity);
safeInit('timeline', initTimeline);
safeInit('wins', initWins);
safeInit('recognition', initRecognition);
safeInit('certs', initCerts);
safeInit('gallery', initGallery);
safeInit('lightbox', initLightbox);
safeInit('photo-rail', initPhotoRail);
safeInit('footer', initFooter);

// Generic fade-up entrance for anything not already handled by a module
// with its own stagger (hero copy, section headers, etc).
observeEntrance('.fade-up', { stagger: 0 }, (el) => el.classList.add('visible'));
