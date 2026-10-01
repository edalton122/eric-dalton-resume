// Source: Appendix B of the v2 implementation brief (authoritative).
// All "currently" / tenure / countdown strings on the site are computed
// from this file at runtime — never hardcode a derived value elsewhere.

export const profile = {
  name: 'Eric Dalton',
  title: 'Lead Solutions Engineer',
  employer: 'Salesforce',
  segment: 'CBS (Commercial Business Segment) — New Logo',
  verticals: ['Home Services', 'Specialty Contracting', 'Engineering & Construction'],
  location: 'Atlanta, GA',
  phone: '859-608-6971',
  email: 'ewdalton122@gmail.com',
  linkedin: 'https://www.linkedin.com/in/eric-dalton-se',
  linkedinDisplay: 'linkedin.com/in/eric-dalton-se',
  education: {
    school: 'University of Kentucky',
    degree: 'BBA, Finance',
    years: '2013 – 2017',
  },
  // ISO dates — every "years at Salesforce" / "months in role" figure is
  // computed from these, not written as a string anywhere else.
  tenureStart: '2019-12-01',
  // Data-currency date for revenue/pipeline figures. Update this each time
  // revenue.js is refreshed; everything marked "YTD" reads from here.
  asOf: '2026-09-30',
  openPipeline: 2250000,
  // TODO(eric): write one sentence on what kind of role/team you're looking
  // for next — the Future Aspirations section lists ambitions but never
  // states this, which is the one thing a hiring manager actually wants to know.
  lookingFor: null,
  siteUrl: 'https://edalton122.github.io/eric-dalton-resume/',
  resumePdf: './Eric-Dalton-Resume.pdf',
  // TODO(eric): the committed PDF still contains [PHONE]/[EMAIL] placeholders.
  // Replace Eric-Dalton-Resume.pdf with the finished 3-page version — the
  // download link below works regardless, but it currently serves stale content.
  resumeHtml: './resume.html',
  // Sanitized label — profile.js always loads regardless of PRIVACY_MODE
  // (it isn't part of the public/full split), so the customer name itself
  // must never appear here even though the URL slug does.
  liveArtifacts: [
    { label: 'Live Interactive Customer Deck — Water Infrastructure Account', url: 'https://edalton122.github.io/bradley-salesforce-deck/' },
  ],
  // Single flag gating all analytics. Off by default — turn on only once
  // Eric has picked a privacy-respecting provider (Plausible / GoatCounter /
  // Cloudflare Web Analytics) and supplied the site id.
  // TODO(eric): set analytics.enabled = true and fill in `script`/`attrs` once chosen.
  analytics: { enabled: false, script: null, attrs: {} },
};

/** Whole years at Salesforce, rounded, for display (e.g. "7 Yrs"). */
export function yearsAtSalesforce(today = new Date()) {
  const start = new Date(profile.tenureStart);
  const months = monthsBetween(start, today);
  return Math.round(months / 12);
}

/** Exact months between two dates (whole months, calendar-aware).
 * Uses UTC getters — see the comment in roles.js's monthsInRole for why
 * mixing UTC-parsed date strings with local getters causes an off-by-one
 * month error in negative-UTC-offset zones. */
export function monthsBetween(start, end) {
  const s = new Date(start), e = new Date(end);
  return (e.getUTCFullYear() - s.getUTCFullYear()) * 12 + (e.getUTCMonth() - s.getUTCMonth()) +
    (e.getUTCDate() >= s.getUTCDate() ? 0 : -1);
}
