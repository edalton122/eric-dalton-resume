// Source: Salesforce Deal Contribution records, FY23–FY27 YTD.
// Mirrors resume.html's revenue table — this file is the single source of
// truth; the chart explorer, the "By the Numbers" cards, and the Ask Eric
// corpus all derive their figures from here. Never hardcode a derived
// number (average, cumulative, %) anywhere else — compute it from this.
//
// Fiscal year note: Salesforce FY runs Feb–Jan. FY24 (Feb 2023–Jan 2024)
// falls entirely inside the Solution Engineer tenure (May 2022–Aug 2024),
// NOT Senior Solutions Engineer — this was wrong in v1 and is corrected here.
// FY25/FY26 straddle the Solution Engineer → Senior SE → Lead SE promotions;
// the résumé attributes those two years' totals to the Senior SE tenure,
// which is the framing kept in copy, while the drill-down panel states the
// exact role span honestly.

export const revenue = {
  years: [
    {
      fy: 'FY23',
      period: 'Feb 2022 – Jan 2023',
      acv: 573190,
      deals: 106,
      partial: false,
      roleSpan: 'Account Specialist → Solution Engineer',
      headline: 'Ramp year — closed the first 106 deals of the current run.',
      recognitionIds: [],
      notableWinIds: [],
    },
    {
      fy: 'FY24',
      period: 'Feb 2023 – Jan 2024',
      acv: 2904583,
      deals: 234,
      partial: false,
      roleSpan: 'Solution Engineer',
      headline: 'Highest single-year ACV production of any Solutions Engineer in the segment — roughly one closed deal per working day.',
      recognitionIds: ['se-of-the-year', 'creative-hustle'],
      notableWinIds: ['hacking-immigration-law'],
    },
    {
      fy: 'FY25',
      period: 'Feb 2024 – Jan 2025',
      acv: 1429770,
      deals: 145,
      partial: false,
      roleSpan: 'Solution Engineer → Senior Solutions Engineer',
      headline: 'Sustained production while taking on Data Cloud community leadership and the NASA enablement curriculum.',
      recognitionIds: [],
      notableWinIds: [],
    },
    {
      fy: 'FY26',
      period: 'Feb 2025 – Jan 2026',
      acv: 1121180,
      deals: 121,
      partial: false,
      roleSpan: 'Senior Solutions Engineer → Lead Solutions Engineer',
      headline: 'Deliberate move upmarket — fewer, larger pursuits as enablement and leadership scope expanded.',
      recognitionIds: [],
      notableWinIds: [],
    },
    {
      fy: 'FY27 YTD',
      period: 'Feb 2026 – Sep 2026',
      acv: 281357,
      deals: 17,
      partial: true,
      roleSpan: 'Lead Solutions Engineer',
      headline: 'Partial year. $300K+ closed across three six-figure deals in April alone; $2.25M+ still in active pipeline.',
      recognitionIds: ['rvp-recognition'],
      notableWinIds: ['spatco-energy', 'april-2026-month'],
    },
  ],
  // TODO(eric): add annual quota per FY here (e.g. { fy: 'FY24', quota: 2500000 })
  // to enable the attainment reference line in the chart explorer's ACV view.
  // Leave absent — do not fabricate quota figures. The toggle stays hidden
  // until this is populated.
  quota: null,
};

export function totalACV() {
  return revenue.years.reduce((sum, y) => sum + y.acv, 0);
}
export function totalDeals() {
  return revenue.years.reduce((sum, y) => sum + y.deals, 0);
}
export function avgDealSize(year) {
  return Math.round(year.acv / year.deals);
}
export function cumulativeSeries() {
  let running = 0;
  return revenue.years.map(y => (running += y.acv));
}
export function peakYear() {
  return revenue.years.reduce((max, y) => (y.acv > max.acv ? y : max), revenue.years[0]);
}
export function bestMonthLabel() {
  // Hand-sourced from the FY27 recognition record, not derivable from the
  // annual table alone (deal-level, not year-level data).
  return '$300K+ across three six-figure deals in a single month (April 2026)';
}
