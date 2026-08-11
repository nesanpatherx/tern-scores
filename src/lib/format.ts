/** Shortens large counts for dense tables and cards. */
export function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 10_000) return `${Math.round(n / 1000)}k`
  if (n >= 1_000) return `${(n / 1000).toFixed(1)}k`
  return String(Math.round(n))
}

/** Percentage change with an explicit sign. Large swings are rounded to whole numbers. */
export function signedPct(pct: number): string {
  const rounded = Math.abs(pct) >= 10 ? Math.round(pct) : Math.round(pct * 10) / 10
  return `${rounded > 0 ? '+' : ''}${rounded}%`
}

export function signedInt(n: number): string {
  return `${n > 0 ? '+' : ''}${n}`
}

export type Trend = {
  text: string
  /** 'up' | 'down' | 'flat' | 'none' — drives colour. */
  direction: 'up' | 'down' | 'flat' | 'none'
}

/**
 * Describes a year-to-date move. Growth from a zero base has no percentage, but
 * reporting it as "—" would hide real progress, so it reads as "new" instead.
 */
export function trend(from: number | null, to: number | null, pct: number | null): Trend {
  if (from === null || to === null) return { text: '—', direction: 'none' }
  if (from === 0 && to > 0) return { text: 'new', direction: 'up' }
  if (from === 0 && to === 0) return { text: '—', direction: 'none' }
  if (to === 0 && from > 0) return { text: 'lost', direction: 'down' }
  if (pct === null) return { text: '—', direction: 'none' }
  if (Math.abs(pct) < 1) return { text: 'flat', direction: 'flat' }
  return { text: signedPct(pct), direction: pct > 0 ? 'up' : 'down' }
}

export const TREND_COLOR: Record<Trend['direction'], string> = {
  up: '#16a34a',
  down: '#dc2626',
  flat: '#8a8a88',
  none: '#c9c9c5',
}

/** '2026-07' → 'Jul 26' */
export function monthLabel(month: string): string {
  const [y, m] = month.split('-')
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${names[parseInt(m, 10) - 1]} ${y.slice(2)}`
}
