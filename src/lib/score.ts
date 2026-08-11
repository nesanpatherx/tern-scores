import type { SemrushMetrics } from './semrush'

/**
 * Points per metric. Must sum to exactly 100 — `TOTAL_POINTS` asserts it below.
 *
 * Weighting rationale: Authority Score and Organic Traffic carry the most because
 * they are the headline outcome signals. Keywords measures breadth of visibility.
 * Referring domains is weighted above raw backlinks because link diversity is the
 * harder and more meaningful thing to earn.
 */
export const METRIC_POINTS = {
  authority: 30,
  traffic: 30,
  keywords: 20,
  referringDomains: 12,
  backlinks: 8,
} as const

/**
 * The value that earns full marks for each metric.
 *
 * Traffic and keywords are scored on a log scale: across this portfolio traffic
 * spans four orders of magnitude, and a linear scale would flatten everything
 * below the top performer to near zero. Authority Score, referring domains and
 * backlinks span a narrower range and score linearly.
 */
export const BENCHMARKS = {
  authority: 40,
  traffic: 20_000,
  keywords: 500,
  referringDomains: 500,
  backlinks: 4_000,
} as const

export const TOTAL_POINTS = Object.values(METRIC_POINTS).reduce((a, b) => a + b, 0)

export type MetricKey = keyof typeof METRIC_POINTS

export type ScoreBreakdown = {
  /** Total score, 0–100. */
  total: number
  parts: Record<MetricKey, { points: number; max: number; value: number }>
}

const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1)

/** Linear share of a benchmark. */
const linear = (value: number, benchmark: number) => clamp01(value / benchmark)

/** Log10 share of a benchmark — compresses wide ranges so mid-tier sites still separate. */
const logarithmic = (value: number, benchmark: number) =>
  clamp01(Math.log10(1 + Math.max(value, 0)) / Math.log10(1 + benchmark))

export function computeScore(m: SemrushMetrics): ScoreBreakdown {
  const P = METRIC_POINTS
  const B = BENCHMARKS

  const parts = {
    authority: {
      value: m.authorityScore,
      max: P.authority,
      points: linear(m.authorityScore, B.authority) * P.authority,
    },
    traffic: {
      value: m.organicTraffic,
      max: P.traffic,
      points: logarithmic(m.organicTraffic, B.traffic) * P.traffic,
    },
    keywords: {
      value: m.organicKeywords,
      max: P.keywords,
      points: logarithmic(m.organicKeywords, B.keywords) * P.keywords,
    },
    referringDomains: {
      value: m.referringDomains,
      max: P.referringDomains,
      points: linear(m.referringDomains, B.referringDomains) * P.referringDomains,
    },
    backlinks: {
      value: m.backlinks,
      max: P.backlinks,
      points: linear(m.backlinks, B.backlinks) * P.backlinks,
    },
  } satisfies ScoreBreakdown['parts']

  const total = Math.round(
    Object.values(parts).reduce((sum, p) => sum + p.points, 0)
  )

  return { total, parts }
}

export const METRIC_LABELS: Record<MetricKey, string> = {
  authority: 'Authority Score',
  traffic: 'Organic Traffic',
  keywords: 'Organic Keywords',
  referringDomains: 'Referring Domains',
  backlinks: 'Backlinks',
}

/** Short column headers for the table. */
export const METRIC_SHORT: Record<MetricKey, string> = {
  authority: 'Authority',
  traffic: 'Traffic',
  keywords: 'Keywords',
  referringDomains: 'Ref. domains',
  backlinks: 'Backlinks',
}

export const METRIC_HELP: Record<MetricKey, string> = {
  authority: "SEMrush's 0–100 measure of overall domain strength, combining link profile, organic traffic and spam signals.",
  traffic: 'Estimated monthly visitors arriving from unpaid search results.',
  keywords: 'Number of distinct search terms the domain ranks for in the top 100 results.',
  referringDomains: 'Number of separate websites linking to the domain. Diversity matters more than raw link count.',
  backlinks: 'Total inbound links pointing at the domain, including multiple links from the same site.',
}

export function scoreBand(score: number): { label: string; color: string } {
  if (score >= 70) return { label: 'Strong', color: '#22c55e' }
  if (score >= 45) return { label: 'Developing', color: '#f59e0b' }
  return { label: 'Needs work', color: '#ef4444' }
}

export type ImprovementArea = {
  key: MetricKey
  label: string
  /** Points left on the table for this metric. */
  gap: number
  /** Current raw value of the metric. */
  value: number
  /** Value needed for full marks. */
  benchmark: number
  /** Share of this metric already earned, 0–1. */
  earned: number
}

/**
 * The metrics where the most points are currently unearned — i.e. where effort buys the
 * biggest score movement. Ordered by absolute points available, not percentage, so a
 * heavily weighted metric that is half-earned outranks a light one that is untouched.
 */
export function improvementAreas(score: ScoreBreakdown, limit = 3): ImprovementArea[] {
  return (Object.keys(METRIC_POINTS) as MetricKey[])
    .map(key => {
      const part = score.parts[key]
      return {
        key,
        label: METRIC_LABELS[key],
        gap: part.max - part.points,
        value: part.value,
        benchmark: BENCHMARKS[key],
        earned: part.max > 0 ? part.points / part.max : 0,
      }
    })
    .filter(a => a.gap > 0.05)
    .sort((a, b) => b.gap - a.gap)
    .slice(0, limit)
}
