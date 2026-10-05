// Source: Appendix B role table + résumé timeline copy (verbatim prose
// preserved from the original index.html timeline items — restructured
// into data, not rewritten). end: null = present; duration is computed,
// never hardcoded, so it never drifts from today's date.

export const roles = [
  {
    id: 'ae-schneider',
    company: 'Schneider',
    companyColor: 'muted',
    title: 'Account Executive',
    location: 'Greater Chicago Area',
    start: '2018-06-01',
    end: '2019-07-01',
    current: false,
    scope: 'B2B transportation and logistics sales across the Chicago market.',
    description: 'Managed a portfolio of B2B accounts for one of North America\u2019s largest transportation and logistics providers. Built foundational skills in outbound prospecting, pipeline management, and consultative selling that directly informed the transition into technical SaaS sales.',
    outcomes: [
      'Drove revenue growth through consultative, account-planning-led sales motions.',
      'Built the prospecting and pipeline discipline carried into every Salesforce role since.',
    ],
    awards: [],
    products: [],
  },
  {
    id: 'sdr',
    company: 'Salesforce',
    companyColor: 'blue',
    title: 'Sales Development Representative',
    location: 'SMB Core · Atlanta, GA',
    start: '2019-12-01',
    end: '2021-04-01',
    current: false,
    scope: 'Pipeline generation and outbound prospecting for the SMB segment.',
    description: 'Generated net-new pipeline for SMB Account Executives through strategic outbound programs and account-level research across the Atlanta market. Built foundational product knowledge and AE partnerships.',
    outcomes: [
      'Built the AE trust and partnership model carried forward into every later role.',
      'Promoted to Account Specialist in 16 months.',
    ],
    awards: [],
    products: ['Sales Cloud'],
  },
  {
    id: 'account-specialist',
    company: 'Salesforce',
    companyColor: 'blue',
    title: 'Account Specialist',
    location: 'SMB Core · Atlanta, GA',
    start: '2021-04-01',
    end: '2022-05-01',
    current: false,
    scope: 'Hybrid commercial role supporting Account Executives across the SMB segment.',
    description: 'Transitioned into a hybrid commercial role supporting Account Executives with technical discovery, solution positioning, and customer-facing engagements. Self-developed and launched "What\u2019s a Salesforce?" — a foundational enablement session for incoming Account Specialist cohorts, delivered 2–3 times per year as a recurring onboarding program ever since.',
    outcomes: [
      'Launched "What\u2019s a Salesforce?" — still delivered as a standing quarterly program five years later.',
      'Promoted to Solutions Engineer in 13 months.',
    ],
    awards: [],
    products: ['Sales Cloud', 'Service Cloud'],
  },
  {
    id: 'solution-engineer',
    company: 'Salesforce',
    companyColor: 'blue',
    title: 'Solution Engineer',
    location: 'SMB Core · Atlanta, GA',
    start: '2022-05-01',
    end: '2024-08-01',
    current: false,
    scope: 'Technical discovery, solution design, and demo delivery across a high-velocity New Logo book of business.',
    description: 'Delivered $2.9M in closed ACV across 234 transactions in FY24 — the highest single-year production of any Solutions Engineer in the segment, averaging roughly one closed deal per working day. Closed a $275K TCV deal with a high-growth immigration law firm. Architected a CPQ and partner-portal solution supporting 1,000+ SKUs with ERP integration. Earned Salesforce Certified Administrator and Platform App Builder certifications.',
    outcomes: [
      'Named Solutions Engineer of the Year and awarded the Creative Hustle Award.',
      'Three-time team MVP; achieved Revenue Cloud Blackbelt.',
    ],
    awards: ['se-of-the-year', 'creative-hustle', 'triple-mvp'],
    products: ['Sales Cloud', 'Revenue Cloud (CPQ)', 'Service Cloud'],
  },
  {
    id: 'senior-se',
    company: 'Salesforce',
    companyColor: 'blue',
    title: 'Senior Solutions Engineer',
    location: 'SMB Core · Atlanta, GA',
    start: '2024-08-01',
    end: '2025-11-01',
    current: false,
    scope: 'Expanded scope with formal community leadership and organization-wide enablement.',
    description: 'Appointed by the Senior Director of Solution Engineering to lead the segment\u2019s Data Cloud specialist community — facilitating monthly strategy sessions across Sales, Service, Analytics, and AI product lines. Designed and delivered a multi-session strategic account engagement curriculum deployed across an entire sales organization. Sustained $1.4M (FY25) and $1.1M (FY26) in annual closed ACV while carrying this expanded leadership scope.',
    outcomes: [
      'Appointed Data Cloud Blackbelt Captain — segment-wide community leadership.',
      'Designed the NASA strategic AE enablement curriculum, deployed org-wide.',
    ],
    awards: ['data-cloud-captain'],
    products: ['Data Cloud', 'Agentforce'],
  },
  {
    id: 'lead-se',
    company: 'Salesforce',
    companyColor: 'gold',
    title: 'Lead Solutions Engineer',
    location: 'CBS Segment · Atlanta, GA',
    start: '2025-11-01',
    end: null,
    current: true,
    scope: 'Current role — technical lead for New Logo acquisition across Home Services, Specialty Contracting, and Engineering & Construction.',
    description: 'Promoted and transferred into the CBS segment. Closed $300K+ across three six-figure deals in a single month and entered the following quarter carrying $5M+ in qualified pipeline against a $900K forecast — recognized by the Regional Vice President as setting the standard for technical sales execution across the organization. Pioneering AI-native demonstration workflows using agentic coding tools, adopted as standard practice across the segment pre-sales team.',
    outcomes: [
      'Recognized by RVP for elite-level impact — $300K+ in a single month.',
      'Pioneered AI-native demo workflows now standard practice across the CBS SE team.',
    ],
    awards: ['rvp-recognition'],
    products: ['Agentforce', 'Data Cloud', 'MuleSoft'],
  },
];

/** Whole months in a role; end=null measures against `today`, not asOf.
 * Uses UTC getters throughout: date-only ISO strings (e.g. '2025-11-01')
 * parse as UTC midnight, but getMonth()/getFullYear() read local time —
 * mixing the two causes an off-by-one-month error in negative-UTC-offset
 * zones (including Eric's own Atlanta/EDT). Reading both ends as UTC
 * keeps the comparison internally consistent. */
export function monthsInRole(role, today = new Date()) {
  const start = new Date(role.start);
  const end = role.end ? new Date(role.end) : today;
  const months = (end.getUTCFullYear() - start.getUTCFullYear()) * 12 + (end.getUTCMonth() - start.getUTCMonth());
  return Math.max(1, months);
}

export function salesforceRoles() {
  return roles.filter(r => r.company === 'Salesforce');
}

export function totalSalesforceMonths(today = new Date()) {
  return salesforceRoles().reduce((sum, r) => sum + monthsInRole(r, today), 0);
}

/** Four promotions across five Salesforce titles (SDR → AS → SE → Senior SE → Lead SE).
 *  length - 1 = 4 promotions (number of moves between titles). */
export function promotionCount() {
  return salesforceRoles().length - 1; // 4
}
