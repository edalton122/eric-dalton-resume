// Source: Appendix B certifications table. Grouped into the three tiers
// specified in §5.7: Certifications / Blackbelts & Appointments / Trailhead.

export const certs = [
  {
    id: 'admin',
    tier: 'certification',
    name: 'Salesforce Certified Administrator',
    issuer: 'Salesforce',
    status: 'achieved',
    detail: 'Jun 2022 · Credential ID 2347981',
    description: 'Core platform configuration, security model, and declarative automation.',
    // TODO(eric): confirm Trailhead's exact public verification deep-link
    // format, then populate verifyUrl. A verifiable credential is worth far
    // more than an unverifiable claim — leave null (no link rendered) until confirmed.
    verifyUrl: null,
    color: 'blue',
  },
  {
    id: 'app-builder',
    tier: 'certification',
    name: 'Salesforce Certified Platform App Builder',
    issuer: 'Salesforce',
    status: 'achieved',
    detail: 'Jul 2022 · Credential ID 2457320',
    description: 'Custom app design, data modeling, and process automation on the Salesforce Platform.',
    verifyUrl: null,
    color: 'blue',
  },
  {
    id: 'agentforce-specialist',
    tier: 'certification',
    name: 'Agentforce Specialist',
    issuer: 'Salesforce',
    status: 'in-progress',
    detail: 'FY27 Q4 target',
    description: 'Agent Builder, topics/actions design, and grounding for autonomous agents.',
    verifyUrl: null,
    color: 'blue',
    // TODO(eric): add real percentComplete (0-100) once there's a basis for
    // one (e.g. modules completed / total). Defaulting to null hides the
    // progress bar rather than fabricating a percentage.
    percentComplete: null,
    targetDate: '2027-01-31', // FY27 Q4 end (Salesforce FY: Feb–Jan)
  },
  {
    id: 'revenue-cloud-blackbelt',
    tier: 'blackbelt',
    name: 'Revenue Cloud Blackbelt',
    issuer: 'Salesforce',
    status: 'achieved',
    detail: 'Achieved',
    description: 'Deep CPQ, quoting, and billing specialization — internal Salesforce product mastery program.',
    verifyUrl: null,
    color: 'green',
  },
  {
    id: 'data-cloud-captain',
    tier: 'blackbelt',
    name: 'Data Cloud Blackbelt Captain',
    issuer: 'Salesforce — appointed by Sr. Director of Solution Engineering',
    status: 'active',
    detail: 'Active appointment',
    description: 'Leads the segment\u2019s Data Cloud specialist community; monthly cross-cloud strategy sessions.',
    verifyUrl: null,
    color: 'navy',
  },
  {
    id: 'triple-star-ranger',
    tier: 'trailhead',
    name: 'Triple Star Ranger',
    issuer: 'Trailhead',
    status: 'achieved',
    detail: 'Highest Trailhead tier',
    description: 'Trailhead\u2019s highest individual recognition tier, spanning sustained badge and superbadge completion.',
    verifyUrl: null,
    color: 'gold',
  },
  {
    id: 'process-automation-superbadge',
    tier: 'trailhead',
    name: 'Process Automation Specialist',
    issuer: 'Trailhead Superbadge',
    status: 'achieved',
    detail: 'Achieved',
    description: 'Hands-on, graded superbadge covering Flow, approval processes, and declarative automation at depth.',
    verifyUrl: null,
    color: 'gold',
  },
  {
    id: 'agentblazer-innovator',
    tier: 'trailhead',
    name: 'Agentblazer Innovator',
    issuer: 'Salesforce',
    status: 'achieved',
    detail: 'FY27 Q1 · 2026',
    description: 'Recognizes applied fluency in building and deploying Agentforce agents.',
    verifyUrl: null,
    color: 'gold',
  },
];

export const tierLabels = {
  certification: 'Certifications',
  blackbelt: 'Blackbelts & Appointments',
  trailhead: 'Trailhead',
};

export function certsByTier(tier) {
  return certs.filter(c => c.tier === tier);
}

/** Days remaining until a cert's target date; null if no target. */
export function daysUntil(cert, today = new Date()) {
  if (!cert.targetDate) return null;
  const diff = new Date(cert.targetDate) - today;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
