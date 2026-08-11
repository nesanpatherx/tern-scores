import ScoresTable, { type ScoredPortco } from '@/components/ScoresTable'
import MethodologyNote from '@/components/MethodologyNote'
import { PORTCOS, GROUP_ORDER } from '@/lib/portcos'
import { fetchPortcoMetrics, REVALIDATE_SECONDS } from '@/lib/semrush'
import { computeScore, scoreBand } from '@/lib/score'

// Data comes straight from the SEMrush API and is cached for a day. SEMrush only
// recalculates these figures around monthly, so this stays fresh while keeping the
// portfolio-wide refresh to roughly 900 API units per day.
export const revalidate = REVALIDATE_SECONDS

const C = {
  orange: '#eb5c32',
  nearBlack: '#1a1a18',
  charcoal: '#4a4a48',
  darkGrey: '#8a8a88',
  lightGrey: '#d9d9d9',
  hairline: '#ececea',
  offWhite: '#f7f4f0',
}

async function getScores(): Promise<ScoredPortco[]> {
  const results = await Promise.all(
    PORTCOS.map(async portco => {
      const metrics = await fetchPortcoMetrics(portco)
      return { portco, metrics, score: computeScore(metrics), rank: 0 }
    })
  )

  return results
    .sort((a, b) => b.score.total - a.score.total)
    .map((entry, i) => ({ ...entry, rank: i + 1 }))
}

function StatCard({
  value,
  label,
  sub,
  color,
}: {
  value: string | number
  label: string
  sub?: string
  color?: string
}) {
  return (
    <div className="px-5 py-4" style={{ background: '#ffffff', border: `1px solid ${C.lightGrey}` }}>
      <div className="text-[26px] font-bold leading-none tabular-nums" style={{ color: color ?? C.nearBlack }}>
        {value}
      </div>
      <div className="text-[10px] font-semibold uppercase tracking-[0.1em] mt-2.5" style={{ color: C.darkGrey }}>
        {label}
      </div>
      {sub && <div className="text-[11px] mt-1 truncate" style={{ color: C.darkGrey }}>{sub}</div>}
    </div>
  )
}

export default async function ScoresDashboard() {
  const scored = await getScores()

  const avg = scored.length ? Math.round(scored.reduce((s, r) => s + r.score.total, 0) / scored.length) : 0
  const leader = scored[0]
  const strong = scored.filter(r => r.score.total >= 70).length
  const needsWork = scored.filter(r => r.score.total < 45).length
  const failures = scored.filter(r => r.metrics.error)

  const groups = GROUP_ORDER.map(group => ({
    group,
    rows: scored.filter(r => r.portco.group === group),
  })).filter(g => g.rows.length > 0)

  const updated = new Date().toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <header
        className="px-5 sm:px-6 flex items-center justify-between h-14 sticky top-0 z-20"
        style={{ background: C.nearBlack, borderBottom: `2px solid ${C.orange}` }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-[15px] leading-none select-none shrink-0">
            <span style={{ color: C.orange, fontWeight: 600 }}>Tern</span>
            <span style={{ color: '#ffffff', fontWeight: 300 }}>Capital</span>
          </span>
          <span
            className="text-[11px] hidden sm:inline truncate"
            style={{ color: C.darkGrey, borderLeft: `1px solid ${C.charcoal}`, paddingLeft: 12 }}
          >
            Search visibility scorecard
          </span>
        </div>
        <span className="text-[11px] shrink-0" style={{ color: C.darkGrey }}>
          {PORTCOS.length} companies · {updated}
        </span>
      </header>

      <main className="px-4 sm:px-6 py-6 max-w-[1500px] mx-auto">
        <div className="mb-6 max-w-[760px]">
          <h1 className="text-[19px] font-semibold leading-snug" style={{ color: C.nearBlack }}>
            Organic search performance across the Tern portfolio
          </h1>
          <p className="text-[13px] mt-1.5 leading-relaxed" style={{ color: C.charcoal }}>
            Every company scored out of 100 on the same five SEMrush measures of organic search
            strength. Figures are pulled live from the SEMrush API — no manual uploads, so each
            company is measured on exactly the same basis. Click any row to see how its score is built.
          </p>
        </div>

        {failures.length > 0 && (
          <div
            className="mb-5 px-4 py-3 text-[12px]"
            style={{ background: '#fff8f5', border: `1px solid ${C.orange}`, color: C.charcoal }}
          >
            <strong>SEMrush lookup failed</strong> for {failures.length}{' '}
            {failures.length === 1 ? 'company' : 'companies'}:{' '}
            {failures.map(f => f.portco.name).join(', ')}. Those rows show no data rather than a zero
            score — expand a row for the error.
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px mb-5" style={{ background: C.lightGrey }}>
          <StatCard
            value={avg}
            label="Portfolio average"
            sub="out of 100"
            color={scoreBand(avg).color}
          />
          <StatCard
            value={leader ? leader.score.total : '—'}
            label="Highest score"
            sub={leader?.portco.name}
            color={C.orange}
          />
          <StatCard value={strong} label="Scoring 70+" sub={`of ${scored.length} companies`} />
          <StatCard value={needsWork} label="Scoring under 45" sub="priority for attention" />
        </div>

        <ScoresTable groups={groups} />

        <MethodologyNote />
      </main>
    </div>
  )
}
