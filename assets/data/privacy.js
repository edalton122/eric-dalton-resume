// Controls which dataset the site loads for customer-identifying content
// (signature wins, built projects). Colleague shoutouts ("What Colleagues
// Say") use real names/titles directly in index.html by explicit, repeated
// instruction — that section was deliberately opted out of this
// public/full abstraction, not an oversight.
//
//   'public' → imports *.public.js  (safe for the deployed GitHub Pages site)
//   'full'   → imports *.full.js    (local only; those files are gitignored)
//
// Switching to 'full' and deploying WILL publish real customer names and
// internal Slack content. That is a deliberate act, not a default.
//
// IMPORTANT: this is a content-sourcing control, not a security boundary.
// Anything shipped in a JS module on a public site is readable by anyone who
// opens devtools or clones the repo. Never put anything in *.public.js that
// Eric wouldn't want public, regardless of this flag's value.
export const PRIVACY_MODE = 'public';

export async function loadWins() {
  if (PRIVACY_MODE === 'full') {
    try {
      const mod = await import('./wins.full.js');
      return mod.wins;
    } catch {
      // wins.full.js is gitignored and won't exist on the deployed site —
      // fall back silently rather than throwing or leaving the section blank.
    }
  }
  const mod = await import('./wins.public.js');
  return mod.wins;
}

export async function loadProjects() {
  if (PRIVACY_MODE === 'full') {
    try {
      const mod = await import('./projects.full.js');
      return mod.projects;
    } catch {
      // same silent fallback as above
    }
  }
  const mod = await import('./projects.public.js');
  return mod.projects;
}

/** Footer disclosure line shown only in public mode. */
export function privacyNotice() {
  return PRIVACY_MODE === 'public'
    ? 'Customer names abstracted. Full detail available on request.'
    : null;
}
