import type { SCUpload, GAUpload, SEMUpload } from './supabase'

export type ScoreBreakdown = {
  total: number
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

// Scores each portco 0–100 relative to fixed benchmarks.
// Each metric has a max possible points; partial credit scales linearly up to a ceiling.
function cap(val: number, max: number) { return Math.min(val, max) }
function pct(val: number, benchmark: number, maxPts: number) {
  return cap((val / benchmark) * maxPts, maxPts)
}

export function computeScore(
  sem: SEMUpload | null,
  sc: SCUpload | null,
  ga: GAUpload | null,
): ScoreBreakdown {
  // SEMrush — 40pts
  const authority = sem ? cap((sem.authority_score / 100) * 15, 15) : 0
  const traffic   = sem ? pct(sem.organic_traffic, 5000, 15) : 0
  const keywords  = sem ? pct(sem.organic_keywords, 500, 5) : 0
  const backlinks = sem ? pct(sem.backlinks, 1000, 5) : 0

  // Search Console — 35pts
  const clicks = sc ? pct(sc.clicks, 1000, 10) : 0
  // CTR: 5%+ = full marks
  const ctr = sc ? cap((sc.ctr / 0.05) * 10, 10) : 0
  // Position: 1 = full marks, 50+ = 0
  const position = sc ? cap(Math.max(0, (50 - sc.avg_position) / 49) * 10, 10) : 0

  // GA4 — 25pts
  const users = ga ? pct(ga.users, 2000, 8) : 0
  // Bounce: <30% = full, >80% = 0
  const bounce = ga ? cap(Math.max(0, (0.8 - ga.bounce_rate) / 0.5) * 7, 7) : 0
  // Time on site: 3min+ = full marks
  const timeOnSite = ga ? cap((ga.avg_session_duration / 180) * 5, 5) : 0

  const total = Math.round(
    authority + traffic + keywords + backlinks +
    clicks + ctr + position +
    users + bounce + timeOnSite
  )

  return {
    total,
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
