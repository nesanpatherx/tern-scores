import type { Portco } from './portcos'

/**
 * SEMrush domain metrics for a single portco.
 *
 * `null` on any field is impossible by design — a domain SEMrush has never indexed
 * still returns zeros, and a genuine API failure surfaces as `error` instead so the
 * UI can distinguish "no visibility" from "we could not ask".
 */
export type SemrushMetrics = {
  authorityScore: number
  organicTraffic: number
  organicKeywords: number
  referringDomains: number
  backlinks: number
  /** Which regional database the organic figures came from. */
  database: 'uk' | 'us'
  /** Set when the lookup failed outright. Metrics are zeroed in that case. */
  error?: string
}

const API = 'https://api.semrush.com'

// SEMrush recalculates domain_ranks roughly monthly, so a daily refresh is ample.
// Each portco costs ~60 API units per refresh (10 per domain_ranks line + 40 for
// the backlinks overview), so a full 15-portco pass is ~900 units.
export const REVALIDATE_SECONDS = 60 * 60 * 24

const ZERO: Omit<SemrushMetrics, 'database'> = {
  authorityScore: 0,
  organicTraffic: 0,
  organicKeywords: 0,
  referringDomains: 0,
  backlinks: 0,
}

/** Parses SEMrush's semicolon-delimited CSV into a header→value map. */
function parseRow(text: string): Record<string, string> | null {
  const trimmed = text.trim()
  if (!trimmed || trimmed.startsWith('ERROR')) return null
  const lines = trimmed.split('\n')
  if (lines.length < 2) return null
  const headers = lines[0].split(';')
  const values = lines[1].split(';')
  const row: Record<string, string> = {}
  headers.forEach((h, i) => { row[h.trim()] = (values[i] ?? '').trim() })
  return row
}

function int(row: Record<string, string> | null, ...keys: string[]): number {
  if (!row) return 0
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== '') {
      const n = parseInt(row[k], 10)
      if (Number.isFinite(n)) return n
    }
  }
  return 0
}

async function get(url: string): Promise<string> {
  const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.text()
}

type Organic = { keywords: number; traffic: number; database: 'uk' | 'us' }

async function fetchOrganic(key: string, domain: string, db: 'uk' | 'us'): Promise<Organic> {
  const text = await get(
    `${API}/?type=domain_ranks&key=${key}&export_columns=Dn,Or,Ot&domain=${encodeURIComponent(domain)}&database=${db}`
  )
  const row = parseRow(text)
  return {
    keywords: int(row, 'Organic Keywords', 'Or'),
    traffic: int(row, 'Organic Traffic', 'Ot'),
    database: db,
  }
}

async function fetchBacklinks(key: string, domain: string) {
  const text = await get(
    `${API}/analytics/v1/?key=${key}&type=backlinks_overview&target=${encodeURIComponent(domain)}` +
    `&target_type=root_domain&export_columns=ascore,total,domains_num`
  )
  const row = parseRow(text)
  return {
    authorityScore: int(row, 'Authority Score', 'ascore'),
    backlinks: int(row, 'Total Backlinks', 'total'),
    referringDomains: int(row, 'Referring Domains', 'domains_num'),
  }
}

export async function fetchPortcoMetrics(portco: Portco): Promise<SemrushMetrics> {
  const key = process.env.SEMRUSH_API_KEY
  if (!key) return { ...ZERO, database: 'uk', error: 'SEMRUSH_API_KEY not configured' }

  try {
    // A domain pinned to one database only needs that lookup; otherwise ask both and
    // keep whichever reports more organic traffic. Several portcos return nothing in
    // the UK index despite being UK businesses, so guessing from the TLD is unreliable.
    const databases: ('uk' | 'us')[] = portco.database ? [portco.database] : ['uk', 'us']

    const [organicResults, backlinks] = await Promise.all([
      Promise.all(databases.map(db => fetchOrganic(key, portco.domain, db))),
      fetchBacklinks(key, portco.domain),
    ])

    const best = organicResults.reduce((a, b) => {
      if (b.traffic !== a.traffic) return b.traffic > a.traffic ? b : a
      return b.keywords > a.keywords ? b : a
    })

    return {
      authorityScore: backlinks.authorityScore,
      organicTraffic: best.traffic,
      organicKeywords: best.keywords,
      referringDomains: backlinks.referringDomains,
      backlinks: backlinks.backlinks,
      database: best.database,
    }
  } catch (e) {
    return { ...ZERO, database: 'uk', error: e instanceof Error ? e.message : String(e) }
  }
}
