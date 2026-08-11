import { H, MEASUREMENT_START, type HistoryRow, type PortcoRecord } from './data'

/**
 * Three pillars, 100 points total. Kept as data so the UI and the methodology note
 * read from the same source and cannot drift apart.
 *
 * Search  — is the site winning classic organic results?
 * AI      — is it being cited by answer engines (AI Overviews, People Also Ask)?
 * Authority — does it have the link foundation to sustain either?
 */
export const PILLARS = {
  search: { label: 'Search', points: 40 },
  ai: { label: 'AI visibility', points: 30 },
  authority: { label: 'Authority', points: 30 },
} as const

export type PillarKey = keyof typeof PILLARS

export const METRICS = {
  traffic:          { pillar: 'search',    label: 'Organic traffic',    points: 18, benchmark: 20_000, scale: 'log' },
  keywords:         { pillar: 'search',    label: 'Ranking keywords',   points: 12, benchmark: 500,    scale: 'log' },
  top3:             { pillar: 'search',    label: 'Top-3 positions',    points: 10, benchmark: 30,     scale: 'linear' },
  aiOverview:       { pillar: 'ai',        label: 'AI Overview results',points: 18, benchmark: 150,    scale: 'linear' },
  peopleAlsoAsk:    { pillar: 'ai',        label: 'People Also Ask',    points: 12, benchmark: 300,    scale: 'linear' },
  authorityScore:   { pillar: 'authority', label: 'Authority Score',    points: 14, benchmark: 40,     scale: 'linear' },
  referringDomains: { pillar: 'authority', label: 'Referring domains',  points: 10, benchmark: 500,    scale: 'linear' },
  backlinks:        { pillar: 'authority', label: 'Backlinks',          points: 6,  benchmark: 4_000,  scale: 'linear' },
} as const

export type MetricKey = keyof typeof METRICS

export const TOTAL_POINTS = Object.values(METRICS).reduce((a, m) => a + m.points, 0)

export const METRIC_HELP: Record<MetricKey, string> = {
  traffic: 'Estimated monthly visitors from unpaid Google results.',
  keywords: 'Distinct search terms the site ranks for in the top 100.',
  top3: 'Search terms where the site ranks in the top three results — where nearly all clicks go.',
  aiOverview: "Search terms where the site is cited in Google's AI Overview. The core measure of AI search visibility.",
  peopleAlsoAsk: 'Search terms where the site answers a People Also Ask question — the other major answer-engine surface.',
  authorityScore: "SEMrush's 0–100 measure of overall domain strength.",
  referringDomains: 'Separate websites linking to the domain. Diversity matters more than raw count.',
  backlinks: 'Total inbound links, including multiple from the same site.',
}

const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1)
const share = (value: number, benchmark: number, scale: 'log' | 'linear') =>
  scale === 'log'
    ? clamp01(Math.log10(1 + Math.max(value, 0)) / Math.log10(1 + benchmark))
    : clamp01(value / benchmark)

export type MetricResult = {
  key: MetricKey
  label: string
  pillar: PillarKey
  value: number
  points: number
  max: number
  benchmark: number
  /** Percentage change since the start of the year. Null when there is no base to divide by. */
  ytd: number | null
  /** Raw start-of-year and current values, so the UI can distinguish growth from zero. */
  ytdFrom: number | null
  ytdTo: number | null
}

export type Scored = {
  record: PortcoRecord
  total: number
  rank: number
  pillars: Record<PillarKey, { earned: number; max: number }>
  metrics: Record<MetricKey, MetricResult>
  latest: HistoryRow
  baseline: HistoryRow
  /** The month active work began — the fair starting point for judging results. */
  measured: HistoryRow
  /** Percentage change in organic traffic since the start of the year. */
  trafficYtdPct: number | null
  /** Absolute change in AI Overview results since the start of the year. */
  aiYtdDelta: number
  /** Percentage change in organic traffic since measurement began. */
  trafficSincePct: number | null
  /** Absolute change in AI Overview results since measurement began. */
  aiSinceDelta: number
  history: readonly HistoryRow[]
}

/** Percentage change, or null when there is no meaningful base to compare against. */
function pctChange(from: number, to: number): number | null {
  if (from === 0) return to === 0 ? 0 : null
  return ((to - from) / from) * 100
}

export function scorePortfolio(records: readonly PortcoRecord[]): Scored[] {
  const scored = records.map(record => {
    const history = record.history
    const latest = history[history.length - 1]
    // Baseline is the first month of the current year, so "YTD" means change during 2026.
    const baseline = history.find(r => r[H.month].startsWith('2026')) ?? history[0]
    const measured = history.find(r => r[H.month] === MEASUREMENT_START) ?? baseline

    const tracked = (idx: number) => ({
      value: latest[idx] as number,
      ytd: pctChange(baseline[idx] as number, latest[idx] as number),
      ytdFrom: baseline[idx] as number,
      ytdTo: latest[idx] as number,
    })
    // Link metrics are a current snapshot only — SEMrush history for them is a separate report.
    const snapshot = (value: number) => ({ value, ytd: null, ytdFrom: null, ytdTo: null })

    const raw: Record<MetricKey, { value: number; ytd: number | null; ytdFrom: number | null; ytdTo: number | null }> = {
      traffic:          tracked(H.traffic),
      keywords:         tracked(H.keywords),
      top3:             tracked(H.top3),
      aiOverview:       tracked(H.aiOverview),
      peopleAlsoAsk:    tracked(H.peopleAlsoAsk),
      authorityScore:   snapshot(record.authorityScore),
      referringDomains: snapshot(record.referringDomains),
      backlinks:        snapshot(record.backlinks),
    }

    const metrics = {} as Record<MetricKey, MetricResult>
    const pillars: Record<PillarKey, { earned: number; max: number }> = {
      search: { earned: 0, max: PILLARS.search.points },
      ai: { earned: 0, max: PILLARS.ai.points },
      authority: { earned: 0, max: PILLARS.authority.points },
    }

    for (const key of Object.keys(METRICS) as MetricKey[]) {
      const def = METRICS[key]
      const points = share(raw[key].value, def.benchmark, def.scale) * def.points
      metrics[key] = {
        key,
        label: def.label,
        pillar: def.pillar,
        value: raw[key].value,
        points,
        max: def.points,
        benchmark: def.benchmark,
        ytd: raw[key].ytd,
        ytdFrom: raw[key].ytdFrom,
        ytdTo: raw[key].ytdTo,
      }
      pillars[def.pillar].earned += points
    }

    const total = Math.round(Object.values(pillars).reduce((s, p) => s + p.earned, 0))

    return {
      record,
      total,
      rank: 0,
      pillars,
      metrics,
      latest,
      baseline,
      measured,
      trafficYtdPct: raw.traffic.ytd,
      aiYtdDelta: latest[H.aiOverview] - baseline[H.aiOverview],
      trafficSincePct: pctChange(measured[H.traffic], latest[H.traffic]),
      aiSinceDelta: latest[H.aiOverview] - measured[H.aiOverview],
      history,
    }
  })

  return scored
    .sort((a, b) => b.total - a.total)
    .map((s, i) => ({ ...s, rank: i + 1 }))
}

export function scoreBand(score: number): { label: string; color: string } {
  if (score >= 60) return { label: 'Strong', color: '#16a34a' }
  if (score >= 35) return { label: 'Developing', color: '#d97706' }
  return { label: 'Needs work', color: '#dc2626' }
}

/** Metrics with the most unearned points — where effort buys the biggest score movement. */
export function improvementAreas(s: Scored, limit = 3): MetricResult[] {
  return Object.values(s.metrics)
    .filter(m => m.max - m.points > 0.05)
    .sort((a, b) => (b.max - b.points) - (a.max - a.points))
    .slice(0, limit)
}
