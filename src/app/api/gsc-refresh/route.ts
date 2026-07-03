import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getGoogleAccessToken } from '@/lib/google-auth'

export const dynamic = 'force-dynamic'

const GSC_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly'
const DAYS = 30

async function fetchGSC(domain: string, token: string) {
  const siteUrl = `sc-domain:${domain.replace(/^www\./, '')}`
  const endDate = new Date().toISOString().split('T')[0]
  const startDate = new Date(Date.now() - DAYS * 86400000).toISOString().split('T')[0]

  const res = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startDate,
        endDate,
        rowLimit: 1,
      }),
      next: { revalidate: 0 },
    }
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`GSC ${domain} → ${res.status}: ${err.slice(0, 200)}`)
  }

  const data = await res.json()
  // Aggregate totals are in the first row when no dimensions are specified
  const totals = data.rows?.[0]

  if (!totals) return null

  return {
    period_start: startDate,
    period_end: endDate,
    clicks: Math.round(totals.clicks ?? 0),
    impressions: Math.round(totals.impressions ?? 0),
    ctr: totals.ctr ?? 0,
    avg_position: totals.position ?? 0,
  }
}

export async function POST() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })

  const sb = createClient(url, key)
  const { data: portcos, error } = await sb
    .from('portcos')
    .select('id, name, domain')

  if (error || !portcos?.length) {
    return NextResponse.json({ error: 'Could not load portcos' }, { status: 500 })
  }

  let token: string
  try {
    token = await getGoogleAccessToken([GSC_SCOPE])
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }

  const results: { name: string; status: string }[] = []

  for (const portco of portcos) {
    try {
      const payload = await fetchGSC(portco.domain, token)
      if (!payload) {
        results.push({ name: portco.name, status: 'no data' })
        continue
      }

      await sb.from('search_console_uploads').delete().eq('portco_id', portco.id)
      const { error: insertErr } = await sb.from('search_console_uploads').insert({
        portco_id: portco.id,
        ...payload,
      })

      results.push({ name: portco.name, status: insertErr ? `error: ${insertErr.message}` : 'ok' })
    } catch (e) {
      results.push({ name: portco.name, status: `failed: ${String(e)}` })
    }
  }

  const ok = results.filter(r => r.status === 'ok').length
  return NextResponse.json({ refreshed: ok, total: portcos.length, results })
}
