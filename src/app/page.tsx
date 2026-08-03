export const dynamic = 'force-dynamic'
export const revalidate = 0

import { unstable_noStore as noStore } from 'next/cache'
import SemrushRefreshButton from '@/components/SemrushRefreshButton'
import GA4RefreshButton from '@/components/GA4RefreshButton'
import ScoresTable from '@/components/ScoresTable'
import { supabase, type PortcoDB, type SCUpload, type GAUpload, type SEMUpload } from '@/lib/supabase'
import { computeScore } from '@/lib/score'
import { fmtNum, fmtCurrency } from '@/lib/format'

type PortcoRow = {
  portco: PortcoDB
  sc: SCUpload | null
  ga: GAUpload | null
  sem: SEMUpload | null
}

async function getDashboardData(): Promise<PortcoRow[]> {
  noStore()
  if (!supabase) return []

  const [portcosRes, scRes, gaRes, semRes] = await Promise.all([
    supabase.from('portcos').select('*').order('sort_order', { ascending: true }).order('name'),
    supabase.from('search_console_uploads').select('id,portco_id,period_start,period_end,clicks,impressions,ctr,avg_position,uploaded_at').order('uploaded_at', { ascending: false }).limit(50),
    supabase.from('analytics_uploads').select('id,portco_id,period_start,period_end,sessions,users,new_users,visits,bounce_rate,avg_session_duration,uploaded_at').order('uploaded_at', { ascending: false }).limit(50),
    supabase.from('semrush_uploads').select('id,portco_id,report_date,authority_score,organic_traffic,organic_keywords,paid_traffic,backlinks,referring_domains,uploaded_at').order('uploaded_at', { ascending: false }).limit(50),
  ])

  const portcos: PortcoDB[] = portcosRes.data ?? []
  const latestSC = new Map<string, SCUpload>()
  const latestGA = new Map<string, GAUpload>()
  const latestSEM = new Map<string, SEMUpload>()

  for (const r of (scRes.data ?? []) as SCUpload[]) {
    if (!latestSC.has(r.portco_id)) latestSC.set(r.portco_id, r)
  }
  for (const r of (gaRes.data ?? []) as GAUpload[]) {
    if (!latestGA.has(r.portco_id)) latestGA.set(r.portco_id, r)
  }
  for (const r of (semRes.data ?? []) as SEMUpload[]) {
    if (!latestSEM.has(r.portco_id)) latestSEM.set(r.portco_id, r)
  }

  return portcos.map(p => ({
    portco: p,
    sc: latestSC.get(p.id) ?? null,
    ga: latestGA.get(p.id) ?? null,
    sem: latestSEM.get(p.id) ?? null,
  }))
}

const C = {
  orange: '#eb5c32',
  nearBlack: '#1a1a18',
  charcoal: '#4a4a48',
  darkGrey: '#999999',
  lightGrey: '#d9d9d9',
  offWhite: '#f7f4f0',
}

function StatCard({ label, value, sub, accent = false }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div className="px-5 py-4" style={{ background: '#ffffff', border: `1px solid ${C.lightGrey}` }}>
      <div className="text-2xl font-bold leading-none" style={{ color: accent ? C.orange : C.nearBlack }}>{value}</div>
      <div className="text-xs font-semibold uppercase tracking-widest mt-2" style={{ color: C.darkGrey }}>{label}</div>
      {sub && <div className="text-xs mt-0.5" style={{ color: C.darkGrey }}>{sub}</div>}
    </div>
  )
}

export default async function ScoresDashboard() {
  const rows = await getDashboardData()

  const scored = rows
    .map(r => ({ ...r, score: computeScore(r.sem, r.sc, r.ga) }))
    .sort((a, b) => b.score.total - a.score.total)

  const avgScore = scored.length
    ? Math.round(scored.reduce((s, r) => s + r.score.total, 0) / scored.length)
    : 0
  const topScore = scored[0]?.score.total ?? 0
  const withData = scored.filter(r => r.sem || r.sc || r.ga).length

  const allUploadDates = rows.flatMap(r => [r.sc?.uploaded_at, r.ga?.uploaded_at, r.sem?.uploaded_at]).filter(Boolean) as string[]
  const lastUpdated = allUploadDates.length
    ? new Date(Math.max(...allUploadDates.map(d => new Date(d).getTime())))
    : null
  const lastUpdatedStr = lastUpdated
    ? lastUpdated.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : null

  const GROUP_ORDER = ['Noveva Software Group', 'Forma Innovations', 'Standalone', 'Other']
  const grouped = GROUP_ORDER.map(g => ({
    group: g,
    rows: scored.filter(r => (r.portco.portco_group ?? 'Other') === g),
  })).filter(g => g.rows.length > 0)

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <header
        className="px-6 flex items-center justify-between h-14 sticky top-0 z-10"
        style={{ background: C.nearBlack, borderBottom: `2px solid ${C.orange}` }}
      >
        <div className="flex items-center gap-3">
          <span className="text-base leading-none select-none">
            <span style={{ color: C.orange, fontWeight: 600 }}>Tern</span>
            <span style={{ color: '#ffffff', fontWeight: 300 }}>Capital</span>
          </span>
          <span className="text-xs hidden sm:inline" style={{ color: C.darkGrey, borderLeft: `1px solid ${C.charcoal}`, paddingLeft: '12px' }}>
            Performance scores
            {lastUpdatedStr && <span style={{ color: C.charcoal, marginLeft: '8px' }}>· Updated {lastUpdatedStr}</span>}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs hidden sm:inline" style={{ color: C.darkGrey }}>{rows.length} companies</span>
          <SemrushRefreshButton />
          <GA4RefreshButton />
        </div>
      </header>

      <main className="px-4 sm:px-6 py-5 w-full">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px mb-6" style={{ background: C.lightGrey }}>
          <StatCard label="Portfolio companies" value={rows.length} />
          <StatCard label="Avg performance score" value={avgScore} sub="out of 100" accent />
          <StatCard label="Top score" value={topScore} sub={scored[0]?.portco.name ?? ''} accent />
          <StatCard label="Companies with data" value={`${withData} / ${rows.length}`} sub="scored portcos" />
        </div>

        <ScoresTable groups={grouped} />

        <div className="mt-6 text-xs" style={{ color: C.darkGrey }}>
          <p><strong style={{ color: C.charcoal }}>Score methodology:</strong> Each portco is scored out of 100 across three sources — SEMrush (40pts: authority, traffic, keywords, backlinks), Search Console (35pts: clicks, CTR, position), and GA4 (25pts: users, bounce rate, time on site). Scores are absolute against fixed benchmarks, not relative to other portcos.</p>
        </div>
      </main>
    </div>
  )
}
