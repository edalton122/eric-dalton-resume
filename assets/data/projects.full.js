// FULL dataset — gitignored, local only, never deployed. Identical to
// projects.public.js except for the records below, which carry real
// customer identifiers. Falls back silently to projects.public.js if absent.

import { projects as publicProjects } from './projects.public.js';

const overrides = {
  'interactive-landing-pages': {
    title: 'Interactive Customer Landing Pages',
    summary: 'Branded, interactive HTML experiences replacing static sales PDFs \u2014 built for USG Water Solutions, Bradley Company, and others.',
  },
  'enterprise-exec-readout': {
    title: 'Enercon Services \u2014 Executive Readout & POV Deck',
  },
  'ec-talk-track-pov': {
    title: 'Mesa Associates \u2014 Full Talk Track + POV',
  },
  'surveys-sizzle-reel': {
    summary: 'Custom demo asset built for Colen Built / OTOWFL to support deal close.',
  },
  'ai-status-update-framework': {
    title: 'Enercon Slackbot AI Status Update Framework',
  },
  'partner-leadgen-microsite': {
    title: 'PuroClean Lead-Gen Microsite',
    summary: 'Interactive Salesforce sandbox with an auto-triggered demo-request flow, built for PuroClean\u2019s partner book of business.',
  },
};

export const projects = publicProjects.map(p =>
  overrides[p.id] ? { ...p, ...overrides[p.id] } : p
);
