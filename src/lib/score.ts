import type { SCUpload, GAUpload, SEMUpload } from './supabase'

/**
 * Points per metric. These must sum to exactly 100, and each source's metrics
 * must sum to its intended weight: SEMrush 40, Search Console 35, GA4 25.
 */
export const METRIC_POINTS = {
  // SEMrush — 40
  authority: 15,
  traffic: 15,
  keywords: 5,
  backlinks: 5,
  // Search Console — 35
  clicks: 12,
  ctr: 12,
  position: 11,
  // GA4 — 25
  users: 10,
  bounce: 8,
  timeOnSite: 7,
} as const

export const SOURCE_WEIGHTS = {
  sem: METRIC_POINTS.authority + METRIC_POINTS.traffic + METRIC_POINTS.keywords + METRIC_POINTS.backlinks,
  sc: METRIC_POINTS.clicks + METRIC_POINTS.ctr + METRIC_POINTS.position,
  ga: METRIC_POINTS.users + METRIC_POINTS.bounce + METRIC_POINTS.timeOnSite,
} as const

export type ScoreBreakdown = {
  /** Coverage-normalised score, 0–100, judged only on metrics that reported. */
  total: number
  /** Points actually earned, out of `available`. */
  raw: number
  /** Maximum points obtainable given which metrics reported. */
  available: number
  /** Percentage of the full 100-point basis that was measurable. */
  coverage: number
  /** Human-readable reasons points were excluded from the basis. */
  excluded: string[]
  /** True when the GA4 users figure was not captured on import and is excluded from the basis. */
  usersExcluded: boolean
  authority: number
  traffic: number
  keywords: number
  backlinks: number
  clicks: number
  ctr: number
  position: number
  users: number
  bounce: number
  timeOnSite: number
}

// Each metric scores linearly against a fixed benchmark, capped at its max points.
function cap(val: number, max: number) { return Math.min(Math.max(val, 0), max) }
function pct(val: number, benchmark: number, maxPts: number) {
  return cap((val / benchmark) * maxPts, maxPts)
}

/**
 * A site cannot record zero users while recording sessions. When that happens the
 * users figure was not captured on import (GA4 exports the column as "Active users",
 * which older uploads missed), so the metric is excluded from the basis rather than
 * scored as a genuine zero.
 */
function usersUnreliable(ga: GAUpload): boolean {
  return (!ga.users || ga.users === 0) && ga.sessions > 0
}

export function computeScore(
  sem: SEMUpload | null,
  sc: SCUpload | null,
  ga: GAUpload | null,
): ScoreBreakdown {
  const P = METRIC_POINTS
  const excluded: string[] = []
  let available = 0

  // SEMrush
  const authority = sem ? cap((sem.authority_score / 100) * P.authority, P.authority) : 0
  const traffic   = sem ? pct(sem.organic_traffic, 5000, P.traffic) : 0
  const keywords  = sem ? pct(sem.organic_keywords, 500, P.keywords) : 0
  const backlinks = sem ? pct(sem.backlinks, 1000, P.backlinks) : 0
  if (sem) available += SOURCE_WEIGHTS.sem
  else excluded.push('SEMrush')

  // Search Console — CTR: 5%+ full marks. Position: 1 full marks, 50+ zero.
  const clicks   = sc ? pct(sc.clicks, 1000, P.clicks) : 0
  const ctr      = sc ? cap((sc.ctr / 0.05) * P.ctr, P.ctr) : 0
  const position = sc ? cap(((50 - sc.avg_position) / 49) * P.position, P.position) : 0
  if (sc) available += SOURCE_WEIGHTS.sc
  else excluded.push('Search Console')

  // GA4 — Bounce: <30% full, >80% zero. Time on site: 3min+ full marks.
  const badUsers   = ga ? usersUnreliable(ga) : false
  const users      = ga && !badUsers ? pct(ga.users, 2000, P.users) : 0
  const bounce     = ga ? cap(((0.8 - ga.bounce_rate) / 0.5) * P.bounce, P.bounce) : 0
  const timeOnSite = ga ? cap((ga.avg_session_duration / 180) * P.timeOnSite, P.timeOnSite) : 0
  if (ga) {
    available += SOURCE_WEIGHTS.ga
    if (badUsers) {
      available -= P.users
      excluded.push('GA4 users (not captured on import)')
    }
  } else {
    excluded.push('GA4')
  }

  const raw =
    authority + traffic + keywords + backlinks +
    clicks + ctr + position +
    users + bounce + timeOnSite

  const total = available > 0 ? Math.round((raw / available) * 100) : 0

  return {
    total,
    raw: Math.round(raw),
    available,
    coverage: available,
    excluded,
    usersExcluded: badUsers,
    authority: Math.round(authority),
    traffic: Math.round(traffic),
    keywords: Math.round(keywords),
    backlinks: Math.round(backlinks),
    clicks: Math.round(clicks),
    ctr: Math.round(ctr),
    position: Math.round(position),
    users: Math.round(users),
    bounce: Math.round(bounce),
    timeOnSite: Math.round(timeOnSite),
  }
}
