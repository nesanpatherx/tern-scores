import type { Portco } from './portcos'

/**
 * SEMrush domain metrics for a single portco.
 *
 * A domain SEMrush has never indexed still returns real zeros, so zeros are
 * meaningful. Genuine failures surface via `error` (nothing retrieved) or
 * `partialError` (some figures retrieved, others not) so the UI can tell
 * "no search visibility" apart from "we could not ask".
 */
export type SemrushMetrics = {
  authorityScore: number
  organicTraffic: number
  organicKeywords: number
  referringDomains: number
  backlinks: number
  /** Which regional database the organic figures came from. */
  database: 'uk' | 'us'
  /** Set when the whole lookup failed. All figures are zero and not meaningful. */
  error?: string
  /** Set when only part of the lookup failed. The figures that did return are real. */
  partialError?: string
}

const API = 'https://api.semrush.com'

// SEMrush recalculates domain_ranks roughly monthly, so a daily refresh is ample.
// Each portco costs ~60 API units per refresh (10 per domain_ranks line + 40 for
// the backlinks overview), so a full 15-portco pass is ~900 units.
export const REVALIDATE_SECONDS = 60 * 60 * 24

const ZERO = {
  authorityScore: 0,
  organicTraffic: 0,
  organicKeywords: 0,
  referringDomains: 0,
  backlinks: 0,
} as const

/**
 * Fetches a SEMrush CSV endpoint and returns its first data row.
 *
 * SEMrush reports failures two different ways: an HTTP error whose body carries the
 * real explanation (403 with "ERROR 120 :: WRONG KEY - ID PAIR"), or HTTP 200 with an
 * ERROR line as the body. Both are surfaced verbatim, because "HTTP 403" alone is not
 * diagnosable — the body is what actually tells you the key is wrong or units are out.
 *
 * Returns null when the endpoint legitimately has no row for this domain.
 */
async function fetchRow(url: string): Promise<Record<string, string> | null> {
  const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } })
  const text = (await res.text()).trim()

  if (text.startsWith('ERROR')) throw new Error(text.split('\n')[0])
  if (!res.ok) throw new Error(text ? `${res.status}: ${text.split('\n')[0]}` : `HTTP ${res.status}`)

  const lines = text.split('\n')
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
    const raw = row[k]
    if (raw !== undefined && raw !== '') {
      const n = parseInt(raw, 10)
      if (Number.isFinite(n)) return n
    }
  }
  return 0
}

const message = (e: unknown) => (e instanceof Error ? e.message : String(e))

type Organic = { keywords: number; traffic: number; database: 'uk' | 'us' }

async function fetchOrganic(key: string, domain: string, db: 'uk' | 'us'): Promise<Organic> {
  const row = await fetchRow(
    `${API}/?type=domain_ranks&key=${key}&export_columns=Dn,Or,Ot` +
    `&domain=${encodeURIComponent(domain)}&database=${db}`
  )
  return {
    keywords: int(row, 'Organic Keywords', 'Or'),
    traffic: int(row, 'Organic Traffic', 'Ot'),
    database: db,
  }
}

async function fetchBacklinks(key: string, domain: string) {
  const row = await fetchRow(
    `${API}/analytics/v1/?key=${key}&type=backlinks_overview&target=${encodeURIComponent(domain)}` +
    `&target_type=root_domain&export_columns=ascore,total,domains_num`
  )
  return {
    authorityScore: int(row, 'Authority Score', 'ascore'),
    backlinks: int(row, 'Total Backlinks', 'total'),
    referringDomains: int(row, 'Referring Domains', 'domains_num'),
  }
}

export async function fetchPortcoMetrics(portco: Portco): Promise<SemrushMetrics> {
  // Trimmed because a trailing newline or space picked up when pasting the key into a
  // deployment dashboard is otherwise indistinguishable from a wrong key.
  const key = process.env.SEMRUSH_API_KEY?.trim()
  if (!key) return { ...ZERO, database: 'uk', error: 'SEMRUSH_API_KEY not configured' }

  // A domain pinned to one database only needs that lookup; otherwise ask both and keep
  // whichever reports more organic traffic. Several UK portcos return nothing in the UK
  // index despite being UK businesses, so inferring the database from the TLD is unreliable.
  const databases: ('uk' | 'us')[] = portco.database ? [portco.database] : ['uk', 'us']

  // The two report types are billed and permissioned separately, so they are settled
  // independently — a backlinks failure must not discard organic figures that did arrive.
  const [organicSettled, backlinksSettled] = await Promise.all([
    Promise.allSettled(databases.map(db => fetchOrganic(key, portco.domain, db))),
    fetchBacklinks(key, portco.domain).then(
      v => ({ ok: true as const, v }),
      e => ({ ok: false as const, e: message(e) }),
    ),
  ])

  const organic = organicSettled
    .filter((r): r is PromiseFulfilledResult<Organic> => r.status === 'fulfilled')
    .map(r => r.value)

  const organicError = organicSettled.find(r => r.status === 'rejected') as PromiseRejectedResult | undefined
  const organicFailed = organic.length === 0

  if (organicFailed && !backlinksSettled.ok) {
    return { ...ZERO, database: 'uk', error: backlinksSettled.e }
  }

  const best = organic.length
    ? organic.reduce((a, b) => {
        if (b.traffic !== a.traffic) return b.traffic > a.traffic ? b : a
        return b.keywords > a.keywords ? b : a
      })
    : null

  const partials: string[] = []
  if (organicFailed) partials.push(`organic figures unavailable (${message(organicError?.reason)})`)
  else if (organicError) partials.push('one regional database was unavailable')
  if (!backlinksSettled.ok) partials.push(`authority and link figures unavailable (${backlinksSettled.e})`)

  return {
    authorityScore: backlinksSettled.ok ? backlinksSettled.v.authorityScore : 0,
    organicTraffic: best?.traffic ?? 0,
    organicKeywords: best?.keywords ?? 0,
    referringDomains: backlinksSettled.ok ? backlinksSettled.v.referringDomains : 0,
    backlinks: backlinksSettled.ok ? backlinksSettled.v.backlinks : 0,
    database: best?.database ?? databases[0],
    partialError: partials.length ? partials.join('; ') : undefined,
  }
}
